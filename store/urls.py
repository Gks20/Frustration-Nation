from django.urls import path
from . import views

app_name = 'store'

urlpatterns = [
    path('catalog/', views.store_catalog, name='catalog'),
    path('categories/', views.categories, name='categories'),
    path('purchase/', views.purchase_item, name='purchase'),
    path('inventory/', views.user_inventory, name='inventory'),
    path('history/', views.purchase_history, name='history'),
]