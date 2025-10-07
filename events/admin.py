from django.contrib import admin
from .models import (
    EventType, PopupEvent, UserEventLog, 
    ChatbotConversation, ChatbotMessage, FakeSystemAlert
)

@admin.register(EventType)
class EventTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'trigger_probability', 'is_active')
    list_filter = ('is_active',)

@admin.register(PopupEvent)
class PopupEventAdmin(admin.ModelAdmin):
    list_display = ('title', 'popup_type', 'priority', 'is_active', 'fake_urgency')
    list_filter = ('popup_type', 'priority', 'is_active', 'fake_urgency')
    search_fields = ('title', 'content')

@admin.register(UserEventLog)
class UserEventLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'popup_event', 'action', 'timestamp', 'user_reaction_time')
    list_filter = ('action', 'timestamp')
    search_fields = ('user__username',)

@admin.register(ChatbotConversation)
class ChatbotConversationAdmin(admin.ModelAdmin):
    list_display = ('conversation_id', 'user', 'is_active', 'started_at', 'user_satisfaction')
    list_filter = ('is_active', 'started_at')

@admin.register(ChatbotMessage)
class ChatbotMessageAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'is_from_bot', 'message_text', 'timestamp')
    list_filter = ('is_from_bot', 'timestamp')

@admin.register(FakeSystemAlert)
class FakeSystemAlertAdmin(admin.ModelAdmin):
    list_display = ('alert_type', 'title', 'fake_urgency_level', 'is_active')
    list_filter = ('alert_type', 'is_active')
