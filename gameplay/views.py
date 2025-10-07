from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login
from django.contrib.auth.models import User
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
import json
import random

from .models import FishingSession, UserProfile, FishingAttempt
from database.models import FishReward

@csrf_exempt
def quick_login(request):
    """Anonymous session for gameplay"""
    if request.method == 'POST':
        # Create anonymous user with session ID as username
        session_id = request.session.session_key
        if not session_id:
            request.session.create()
            session_id = request.session.session_key
        
        username = f"anon_{session_id[:8]}"
        user, created = User.objects.get_or_create(username=username)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        login(request, user)
        return JsonResponse({'success': True, 'coins': profile.total_coins})
    return JsonResponse({'success': False})

@csrf_exempt
def start_fishing(request):
    """Start new fishing session"""
    if request.method == 'POST':
        # Auto-create anonymous user if needed
        if not request.user.is_authenticated:
            session_id = request.session.session_key
            if not session_id:
                request.session.create()
                session_id = request.session.session_key
            
            username = f"anon_{session_id[:8]}"
            user, created = User.objects.get_or_create(username=username)
            profile, _ = UserProfile.objects.get_or_create(user=user)
            login(request, user)
        
        # End any active sessions
        FishingSession.objects.filter(user=request.user, is_active=True).update(
            is_active=False, end_time=timezone.now()
        )
        
        # Create new session
        session = FishingSession.objects.create(user=request.user)
        return JsonResponse({
            'success': True, 
            'session_id': session.id,
            'message': 'Fishing session started!'
        })
    return JsonResponse({'success': False})

@csrf_exempt  
def cast_line(request):
    """Single fishing attempt"""
    if request.method == 'POST':
        # Auto-create anonymous user if needed
        if not request.user.is_authenticated:
            session_id = request.session.session_key
            if not session_id:
                request.session.create()
                session_id = request.session.session_key
            
            username = f"anon_{session_id[:8]}"
            user, created = User.objects.get_or_create(username=username)
            profile, _ = UserProfile.objects.get_or_create(user=user)
            login(request, user)
            
        session = FishingSession.objects.filter(
            user=request.user, is_active=True
        ).first()
        
        if not session:
            # Auto-create session for clicker game
            session = FishingSession.objects.create(
                user=request.user,
                is_active=True
            )
        
        # 60% success rate
        success = random.random() < 0.6
        fish_reward = None
        coins = 0
        
        if success:
            # Get random fish
            fish_reward = FishReward.objects.order_by('?').first()
            coins = random.randint(5, 25)
            
            # Update session stats
            session.fish_caught += 1
            session.coins_earned += coins
            session.save()
            
            # Update user profile
            profile = UserProfile.objects.get(user=request.user)
            profile.total_coins += coins
            profile.total_fish_caught += 1
            profile.save()
        
        # Record attempt
        attempt = FishingAttempt.objects.create(
            session=session,
            fish_reward=fish_reward,
            success=success,
            coins_earned=coins
        )
        
        response = {
            'success': success,
            'coins_earned': coins,
            'fish': None
        }
        
        if fish_reward:
            response['fish'] = {
                'name': fish_reward.name,
                'reward_type': fish_reward.reward_type,
                'text_content': fish_reward.text_content,
                'image_path': fish_reward.image_path,
                'gif_path': fish_reward.gif_path
            }
        
        return JsonResponse(response)
    
    return JsonResponse({'success': False})

def player_stats(request):
    """Get current player stats"""
    # Auto-create anonymous user if needed
    if not request.user.is_authenticated:
        session_id = request.session.session_key
        if not session_id:
            request.session.create()
            session_id = request.session.session_key
        
        username = f"anon_{session_id[:8]}"
        user, created = User.objects.get_or_create(username=username)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        login(request, user)
        
    try:
        profile = UserProfile.objects.get(user=request.user)
        active_session = FishingSession.objects.filter(
            user=request.user, is_active=True
        ).first()
        
        return JsonResponse({
            'username': request.user.username,
            'total_coins': profile.total_coins,
            'total_fish_caught': profile.total_fish_caught,
            'fishing_level': profile.fishing_level,
            'session_active': bool(active_session),
            'session_fish': active_session.fish_caught if active_session else 0
        })
    except UserProfile.DoesNotExist:
        return JsonResponse({'error': 'Profile not found'})
