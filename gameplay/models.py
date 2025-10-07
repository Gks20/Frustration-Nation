from django.db import models
from django.contrib.auth.models import User
from database.models import FishReward

class FishingSession(models.Model):
    """Track user fishing sessions"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    fish_caught = models.IntegerField(default=0)
    coins_earned = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.start_time.strftime('%Y-%m-%d %H:%M')}"

class UserProfile(models.Model):
    """User game stats and inventory"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    total_coins = models.IntegerField(default=100)  # Starting coins
    total_fish_caught = models.IntegerField(default=0)
    fishing_level = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} Profile"

class FishingAttempt(models.Model):
    """Individual fishing attempts with rewards"""
    session = models.ForeignKey(FishingSession, on_delete=models.CASCADE)
    fish_reward = models.ForeignKey(FishReward, on_delete=models.CASCADE, null=True, blank=True)
    success = models.BooleanField(default=False)
    coins_earned = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        result = "Success" if self.success else "Failed"
        return f"{result} - {self.timestamp.strftime('%H:%M:%S')}"
