from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
import json
import random
import uuid
from datetime import timedelta

from .models import (
    EventType, PopupEvent, UserEventLog, 
    ChatbotConversation, ChatbotMessage, FakeSystemAlert
)

def should_trigger_event(request):
    """Check if an annoying event should trigger"""
    # 15% chance of some kind of interruption (reduced from 20%)
    if random.random() > 0.15:
        return JsonResponse({'trigger': False})
    
    # Get random active popup
    active_popups = PopupEvent.objects.filter(is_active=True)
    if not active_popups.exists():
        return JsonResponse({'trigger': False})
    
    popup = random.choice(active_popups)
    
    return JsonResponse({
        'trigger': True,
        'event_type': 'popup',
        'popup_id': popup.id
    })

def get_popup_event(request, popup_id):
    """Get specific popup event details"""
    try:
        popup = PopupEvent.objects.get(id=popup_id, is_active=True)
        
        # Log that event was shown
        if request.user.is_authenticated:
            UserEventLog.objects.create(
                user=request.user,
                popup_event=popup,
                action='SHOWN',
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
        
        return JsonResponse({
            'id': popup.id,
            'title': popup.title,
            'content': popup.content,
            'type': popup.popup_type,
            'priority': popup.priority,
            'requires_interaction': popup.requires_interaction,
            'auto_close_seconds': popup.auto_close_seconds,
            'is_urgent': popup.is_urgent
        })
    except PopupEvent.DoesNotExist:
        return JsonResponse({'error': 'Popup not found'}, status=404)

@csrf_exempt
def handle_popup_action(request):
    """Handle user interaction with popup"""
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Please login first'})
            
        try:
            data = json.loads(request.body)
            popup_id = data.get('popup_id')
            action = data.get('action')  # 'CLICKED', 'DISMISSED', 'IGNORED'
            reaction_time = data.get('reaction_time', 0)
            
            popup = PopupEvent.objects.get(id=popup_id)
            
            UserEventLog.objects.create(
                user=request.user,
                popup_event=popup,
                action=action,
                user_reaction_time=reaction_time
            )
            
            # Fake consequences based on action
            response = {'success': True}
            
            if action == 'CLICKED':
                response['message'] = 'Thanks for clicking! Nothing happened.'
                response['consequence'] = 'wasted_time'
            elif action == 'DISMISSED':
                response['message'] = 'Popup dismissed. It will return soon.'
                response['consequence'] = 'temporary_relief'
            elif action == 'IGNORED':
                response['message'] = 'Ignoring won\'t make it go away!'
                response['consequence'] = 'persistent_annoyance'
            
            return JsonResponse(response)
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'POST required'})

def start_chatbot(request):
    """Start annoying chatbot conversation"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Please login first'})
        
    conversation_id = f"CHAT-{uuid.uuid4().hex[:8].upper()}"
    
    conversation = ChatbotConversation.objects.create(
        user=request.user,
        conversation_id=conversation_id
    )
    
    # Initial bot message
    initial_messages = [
        "Hi! I'm here to help! What can I do for you today?",
        "Hello! I noticed you're using our service. Need assistance?",
        "Greetings! I'm your virtual assistant. How may I provide unhelpful help?",
        "Hi there! I'm a chatbot and I'm legally required to ask if you need help!"
    ]
    
    ChatbotMessage.objects.create(
        conversation=conversation,
        is_from_bot=True,
        message_text=random.choice(initial_messages)
    )
    
    return JsonResponse({
        'conversation_id': conversation_id,
        'message': 'Chatbot conversation started!'
    })

@csrf_exempt
def chatbot_message(request):
    """Handle chatbot conversation"""
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Please login first'})
            
        try:
            data = json.loads(request.body)
            conversation_id = data.get('conversation_id')
            user_message = data.get('message', '')
            
            conversation = ChatbotConversation.objects.get(
                conversation_id=conversation_id,
                user=request.user,
                is_active=True
            )
            
            # Save user message
            ChatbotMessage.objects.create(
                conversation=conversation,
                is_from_bot=False,
                message_text=user_message
            )
            
            # Generate unhelpful bot response
            unhelpful_responses = [
                "I understand your concern, but I can't actually help with that.",
                "That's an interesting question! Unfortunately, I don't know the answer.",
                "I'm sorry, but that's outside my area of expertise. Is there anything else?",
                "Have you tried turning it off and on again? That fixes everything!",
                "I'd love to help, but I'm just a chatbot. Have you considered calling someone who cares?",
                "That sounds frustrating! I wish I could do something about it.",
                "I'm programmed to be helpful, but I'm not very good at it.",
                "Let me connect you with a human... just kidding, there are no humans here."
            ]
            
            bot_response = random.choice(unhelpful_responses)
            
            ChatbotMessage.objects.create(
                conversation=conversation,
                is_from_bot=True,
                message_text=bot_response
            )
            
            return JsonResponse({
                'bot_response': bot_response,
                'helpful': False,
                'satisfaction_rating': random.randint(1, 3)  # Always low
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'POST required'})

def get_fake_system_alert(request):
    """Generate fake system alerts"""
    alerts = FakeSystemAlert.objects.filter(is_active=True)
    if not alerts.exists():
        return JsonResponse({'alert': None})
    
    alert = random.choice(alerts)
    
    return JsonResponse({
        'alert_type': alert.alert_type,
        'title': alert.title,
        'message': alert.message,
        'urgency_level': alert.fake_urgency_level,
        'immediate_action': alert.requires_immediate_action,
        'fake_countdown': random.randint(30, 300)  # Fake urgency timer
    })

def user_annoyance_stats(request):
    """Get user's annoyance statistics"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Please login first'})
        
    logs = UserEventLog.objects.filter(user=request.user)
    
    stats = {
        'total_interruptions': logs.count(),
        'popups_clicked': logs.filter(action='CLICKED').count(),
        'popups_dismissed': logs.filter(action='DISMISSED').count(),
        'popups_ignored': logs.filter(action='IGNORED').count(),
        'rage_quits': logs.filter(action='RAGED_QUIT').count(),
        'average_reaction_time': 0,
        'most_annoying_popup': None
    }
    
    if logs.exists():
        reaction_times = logs.exclude(user_reaction_time__isnull=True)
        if reaction_times.exists():
            avg_time = sum(log.user_reaction_time for log in reaction_times) / reaction_times.count()
            stats['average_reaction_time'] = round(avg_time, 2)
    
    return JsonResponse(stats)
