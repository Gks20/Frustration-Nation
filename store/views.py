from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
import json
import random
import uuid
from datetime import timedelta

from .models import Product, ProductCategory, Purchase, UserInventory
from gameplay.models import UserProfile

def store_catalog(request):
    """Get all available products"""
    products = Product.objects.filter(is_available=True).select_related('category')
    
    catalog = []
    for product in products:
        catalog.append({
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'price': product.price_coins,
            'discounted_price': product.discounted_price,
            'category': product.category.name,
            'rarity': product.rarity,
            'discount': product.fake_discount,
            'stock': product.stock_quantity
        })
    
    return JsonResponse({'products': catalog})

def categories(request):
    """Get product categories"""
    cats = ProductCategory.objects.filter(is_active=True)
    return JsonResponse({
        'categories': [{'id': c.id, 'name': c.name, 'description': c.description} for c in cats]
    })

@csrf_exempt
def purchase_item(request):
    """Fake purchase processing"""
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'Please login first'})
            
        try:
            data = json.loads(request.body)
            product_id = data.get('product_id')
            quantity = data.get('quantity', 1)
            
            product = Product.objects.get(id=product_id, is_available=True)
            profile = UserProfile.objects.get(user=request.user)
            
            total_cost = product.discounted_price * quantity
            
            # Check if user has enough coins
            if profile.total_coins < total_cost:
                return JsonResponse({
                    'success': False,
                    'error': 'Insufficient coins',
                    'required': total_cost,
                    'available': profile.total_coins
                })
            
            # Create fake transaction
            fake_tx_id = f"TX-{uuid.uuid4().hex[:8].upper()}"
            
            # Random fake payment processing delay simulation
            fake_status = random.choices(
                ['SUCCESS', 'FAILED'], 
                weights=[85, 15]  # 85% success rate
            )[0]
            
            purchase = Purchase.objects.create(
                user=request.user,
                product=product,
                quantity=quantity,
                total_cost=total_cost,
                status=fake_status,
                fake_transaction_id=fake_tx_id,
                fake_delivery_date=timezone.now() + timedelta(days=random.randint(1, 7))
            )
            
            if fake_status == 'SUCCESS':
                # Deduct coins
                profile.total_coins -= total_cost
                profile.save()
                
                # Add to inventory
                inventory_item, created = UserInventory.objects.get_or_create(
                    user=request.user,
                    product=product,
                    defaults={'quantity': quantity}
                )
                if not created:
                    inventory_item.quantity += quantity
                    inventory_item.save()
                
                return JsonResponse({
                    'success': True,
                    'transaction_id': fake_tx_id,
                    'message': f'Successfully purchased {quantity}x {product.name}!',
                    'remaining_coins': profile.total_coins,
                    'delivery_date': purchase.fake_delivery_date.strftime('%Y-%m-%d')
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Payment processing failed (fake error)',
                    'transaction_id': fake_tx_id,
                    'message': 'Your coins are safe, try again!'
                })
                
        except Product.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Product not found'})
        except UserProfile.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'User profile not found'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'POST method required'})

def user_inventory(request):
    """Get user's purchased items"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Please login first'})
        
    inventory = UserInventory.objects.filter(user=request.user).select_related('product')
    
    items = []
    for item in inventory:
        items.append({
            'product_name': item.product.name,
            'quantity': item.quantity,
            'rarity': item.product.rarity,
            'acquired_date': item.acquired_date.strftime('%Y-%m-%d'),
            'original_price': item.product.price_coins
        })
    
    return JsonResponse({'inventory': items})

def purchase_history(request):
    """Get user's purchase history"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Please login first'})
        
    purchases = Purchase.objects.filter(user=request.user).select_related('product').order_by('-purchase_date')
    
    history = []
    for purchase in purchases:
        history.append({
            'transaction_id': purchase.fake_transaction_id,
            'product_name': purchase.product.name,
            'quantity': purchase.quantity,
            'total_cost': purchase.total_cost,
            'status': purchase.status,
            'purchase_date': purchase.purchase_date.strftime('%Y-%m-%d %H:%M'),
            'delivery_date': purchase.fake_delivery_date.strftime('%Y-%m-%d') if purchase.fake_delivery_date else None
        })
    
    return JsonResponse({'purchases': history})
