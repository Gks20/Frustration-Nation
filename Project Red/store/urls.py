# import library
from django.urls import path
from . import views

app_name = 'store'

# URL to be used to navigate to the store
urlpatterns = [
    path('', views.storefront, name='storefront'),
]
