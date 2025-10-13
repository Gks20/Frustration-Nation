from django.urls import path
from . import views

app_name = 'store'

urlpatterns = [
    path('', views.storefront, name='storefront'),
]