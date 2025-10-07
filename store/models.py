from django.db import models
from django.contrib.auth.models import User
from gameplay.models import UserProfile

class ProductCategory(models.Model):
    """Categories for ridiculous store items"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Product Categories"

class Product(models.Model):
    """Ridiculous store products"""
    RARITY_CHOICES = [
        ('COMMON', 'Common Junk'),
        ('RARE', 'Rare Garbage'),
        ('EPIC', 'Epic Nonsense'),
        ('LEGENDARY', 'Legendary Absurdity')
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField()
    price_coins = models.IntegerField()
    category = models.ForeignKey(ProductCategory, on_delete=models.CASCADE)
    rarity = models.CharField(max_length=20, choices=RARITY_CHOICES, default='COMMON')
    is_available = models.BooleanField(default=True)
    stock_quantity = models.IntegerField(default=999)  # Fake infinite stock
    fake_discount = models.IntegerField(default=0)  # Fake % discount
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.price_coins} coins"
    
    @property
    def discounted_price(self):
        if self.fake_discount > 0:
            return int(self.price_coins * (1 - self.fake_discount / 100))
        return self.price_coins

class Purchase(models.Model):
    """Track fake purchases and transactions"""
    STATUS_CHOICES = [
        ('PENDING', 'Processing Payment...'),
        ('SUCCESS', 'Purchase Complete!'),
        ('FAILED', 'Payment Failed (Fake)'),
        ('REFUNDED', 'Refunded (Also Fake)')
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    total_cost = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    fake_transaction_id = models.CharField(max_length=50, unique=True)
    purchase_date = models.DateTimeField(auto_now_add=True)
    fake_delivery_date = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.product.name} ({self.status})"

class UserInventory(models.Model):
    """Track user's fake purchases"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    acquired_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} owns {self.quantity}x {self.product.name}"
    
    class Meta:
        unique_together = ('user', 'product')
