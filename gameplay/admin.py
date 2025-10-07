from django.contrib import admin
from .models import FishingSession, UserProfile, FishingAttempt

@admin.register(FishingSession)
class FishingSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'start_time', 'fish_caught', 'coins_earned', 'is_active')
    list_filter = ('is_active', 'start_time')
    search_fields = ('user__username',)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_coins', 'total_fish_caught', 'fishing_level')
    search_fields = ('user__username',)

@admin.register(FishingAttempt)
class FishingAttemptAdmin(admin.ModelAdmin):
    list_display = ('session', 'success', 'fish_reward', 'coins_earned', 'timestamp')
    list_filter = ('success', 'timestamp')
