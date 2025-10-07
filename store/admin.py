from django.contrib import admin
from .models import ProductCategory, Product, Purchase, UserInventory

@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')
    list_filter = ('is_active',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price_coins', 'category', 'rarity', 'is_available', 'fake_discount')
    list_filter = ('category', 'rarity', 'is_available')
    search_fields = ('name', 'description')

@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'total_cost', 'status', 'purchase_date')
    list_filter = ('status', 'purchase_date')
    search_fields = ('user__username', 'fake_transaction_id')

@admin.register(UserInventory)
class UserInventoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'quantity', 'acquired_date')
    list_filter = ('acquired_date',)
    search_fields = ('user__username', 'product__name')
