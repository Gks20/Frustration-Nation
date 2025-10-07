from django.contrib import admin
from .models import FishReward, RedeemedFish

@admin.register(FishReward)
class FishRewardAdmin(admin.ModelAdmin):
    """Admin interface for managing fish rewards."""
    list_display = ('id', 'fish_type', 'get_preview', 'created_date')
    list_filter = ('fish_type',)
    search_fields = ('message', 'media_url')
    readonly_fields = ('id',)
    ordering = ('fish_type', 'id')
    
    fieldsets = (
        ('Fish Information', {
            'fields': ('fish_type', 'message', 'media_url')
        }),
        ('System Information', {
            'fields': ('id',),
            'classes': ('collapse',)
        }),
    )

    def get_preview(self, obj):
        """Show preview of fish content in admin list."""
        if obj.fish_type == 'TEXT' and obj.message:
            # Truncate long messages
            return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
        elif obj.media_url:
            # Show filename only
            import os
            return os.path.basename(obj.media_url)
        return 'No content'
    
    get_preview.short_description = 'Preview'

    def created_date(self, obj):
        """Show availability status."""
        return "Available"
    
    created_date.short_description = 'Status'

@admin.register(RedeemedFish)
class RedeemedFishAdmin(admin.ModelAdmin):
    """Admin interface for tracking fish redemptions."""
    list_display = ('id', 'user', 'fish_reward_type', 'clicks_before_redeem', 'redeemed_at')
    list_filter = ('fish_reward__fish_type', 'redeemed_at')
    search_fields = ('user__username', 'fish_reward__message')
    readonly_fields = ('id', 'redeemed_at', 'fish_reward')
    ordering = ('-redeemed_at',)
    
    fieldsets = (
        ('Redemption Information', {
            'fields': ('user', 'clicks_before_redeem', 'fish_reward', 'redeemed_at')
        }),
        ('System Information', {
            'fields': ('id',),
            'classes': ('collapse',)
        }),
    )

    def fish_reward_type(self, obj):
        """Show type of redeemed fish reward."""
        return obj.fish_reward.fish_type if obj.fish_reward else 'None'
    
    fish_reward_type.short_description = 'Reward Type'
