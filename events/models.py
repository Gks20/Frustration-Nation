from django.db import models
from django.contrib.auth.models import User
import random

class EventType(models.Model):
    """Types of annoying interruptions"""
    name = models.CharField(max_length=100)
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    trigger_probability = models.FloatField(default=0.1)  # 10% chance
    
    def __str__(self):
        return self.name

class PopupEvent(models.Model):
    """Annoying popup interruptions"""
    POPUP_TYPES = [
        ('AD', 'Fake Advertisement'),
        ('SURVEY', 'Pointless Survey'),
        ('NOTIFICATION', 'Useless Notification'),
        ('OFFER', 'Terrible Offer'),
        ('WARNING', 'Fake System Warning'),
        ('CHATBOT', 'Annoying Chatbot')
    ]
    
    PRIORITY_LEVELS = [
        ('LOW', 'Mildly Annoying'),
        ('MEDIUM', 'Moderately Irritating'),
        ('HIGH', 'Extremely Obnoxious'),
        ('CRITICAL', 'Absolutely Infuriating')
    ]
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    popup_type = models.CharField(max_length=20, choices=POPUP_TYPES)
    priority = models.CharField(max_length=20, choices=PRIORITY_LEVELS, default='MEDIUM')
    event_type = models.ForeignKey(EventType, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    requires_interaction = models.BooleanField(default=True)
    auto_close_seconds = models.IntegerField(null=True, blank=True)
    fake_urgency = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.popup_type}: {self.title}"
    
    @property
    def is_urgent(self):
        return self.fake_urgency or self.priority in ['HIGH', 'CRITICAL']

class UserEventLog(models.Model):
    """Track which events annoyed which users"""
    ACTION_CHOICES = [
        ('SHOWN', 'Event Displayed'),
        ('CLICKED', 'User Clicked'),
        ('DISMISSED', 'User Dismissed'),
        ('IGNORED', 'User Ignored'),
        ('RAGED_QUIT', 'User Rage Quit')
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    popup_event = models.ForeignKey(PopupEvent, on_delete=models.CASCADE)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    user_reaction_time = models.FloatField(null=True, blank=True)  # Seconds
    user_agent = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.action} - {self.popup_event.title}"

class ChatbotConversation(models.Model):
    """Annoying chatbot interactions"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    conversation_id = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    user_satisfaction = models.IntegerField(default=1)  # 1-10 scale (always low)
    
    def __str__(self):
        return f"Chatbot #{self.conversation_id} with {self.user.username}"

class ChatbotMessage(models.Model):
    """Individual chatbot messages"""
    conversation = models.ForeignKey(ChatbotConversation, on_delete=models.CASCADE)
    is_from_bot = models.BooleanField(default=True)
    message_text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    was_helpful = models.BooleanField(default=False)  # Always false
    
    def __str__(self):
        sender = "Bot" if self.is_from_bot else "User"
        return f"{sender}: {self.message_text[:50]}..."

class FakeSystemAlert(models.Model):
    """Fake system warnings and alerts"""
    ALERT_TYPES = [
        ('VIRUS', 'Fake Virus Warning'),
        ('UPDATE', 'Unnecessary Update'),
        ('STORAGE', 'Fake Storage Full'),
        ('SECURITY', 'Fake Security Breach'),
        ('PERFORMANCE', 'Fake Performance Issue')
    ]
    
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    fake_urgency_level = models.IntegerField(default=8)  # 1-10 scale
    requires_immediate_action = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.alert_type}: {self.title}"
