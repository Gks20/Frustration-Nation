from django.urls import path
from . import views

app_name = 'events'

urlpatterns = [
    path('trigger-check/', views.should_trigger_event, name='trigger_check'),
    path('popup/<int:popup_id>/', views.get_popup_event, name='get_popup'),
    path('popup-action/', views.handle_popup_action, name='popup_action'),
    path('chatbot/start/', views.start_chatbot, name='start_chatbot'),
    path('chatbot/message/', views.chatbot_message, name='chatbot_message'),
    path('system-alert/', views.get_fake_system_alert, name='system_alert'),
    path('user-stats/', views.user_annoyance_stats, name='user_stats'),
]