import random
from django.conf import settings
from django.db import models

# Model to store all possible fish rewards (text, image, gif)
class FishReward(models.Model):
    """
    Defines the types of rewards users can receive.
    """
    # Define the types of fish rewards
    FISH_TYPE_CHOICES = [
        ('TEXT', 'Text Fish'),
        ('IMG', 'Image Fish'),
        ('GIF', 'GIF Fish'),
    ]

    fish_type = models.CharField(
        max_length=4,
        choices=FISH_TYPE_CHOICES,
        help_text="The type of fish reward, e.g., TEXT, IMG, or GIF."
    )
    # Using a standard AutoField for the primary key is a common practice.
    # The 'reward_id' was removed as the default 'id' field is sufficient.
    
    message = models.TextField(
        blank=True,
        null=True,
        help_text="Text message for text fish rewards."
    )
    media_url = models.TextField(
        blank=True,
        null=True,
        help_text="File path or URL for image/gif rewards."
    )

    class Meta:
        verbose_name = "Fish Reward"
        verbose_name_plural = "Fish Rewards"
        

    def __str__(self):
        # Display format for admin or debugging
        return f"{self.fish_type} - {self.id}"


# Model to track each fish redemption by a user
class RedeemedFish(models.Model):
    """
    Tracks each time a user redeems a reward.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        help_text="The user who redeemed the reward."
    )  # Link to the user who redeemed
    clicks_before_redeem = models.PositiveIntegerField(
        default=0,
        help_text="The number of clicks the user had before redeeming."
    )
    fish_reward = models.ForeignKey(
        FishReward,
        on_delete=models.SET_NULL,
        null=True,
        help_text="The specific fish reward assigned."
    )
    redeemed_at = models.DateTimeField(
        auto_now_add=True,
        help_text="The timestamp of when the reward was redeemed."
    )

    def save(self, *args, **kwargs):
        # Only assign a fish reward the first time the object is saved
        if not self.pk and not self.fish_reward:
            self.fish_reward = self.assign_fish_reward()
        super().save(*args, **kwargs)

    def assign_fish_reward(self):
        """
        Determines and assigns a fish reward based on the clicks_before_redeem count.
        """
        # Determine fish type based on click count
        if self.clicks_before_redeem < 150:
            fish_type = 'TEXT'
        elif 150 <= self.clicks_before_redeem <= 300:
            fish_type = 'IMG'
        else:
            fish_type = 'GIF'

        # Filter available rewards of the correct type
        rewards = FishReward.objects.filter(fish_type=fish_type)

        # Randomly select one reward from the filtered list
        return random.choice(rewards) if rewards.exists() else None

    class Meta:
        verbose_name = "Redeemed Fish"
        verbose_name_plural = "Redeemed Fish"

    def __str__(self):
        # Display format for admin or debugging
        fish_info = f"{self.fish_reward.fish_type} - {self.fish_reward.id}" if self.fish_reward else "No Reward"
        return f"{self.user.username} redeemed {fish_info} after {self.clicks_before_redeem} clicks"