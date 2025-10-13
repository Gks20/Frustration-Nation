from django.urls import path
from . import views

app_name = 'gameplay'

urlpatterns = [
    path('api/start-fishing/', views.start_fishing, name='start_fishing'),
    path('api/status/', views.game_status, name='game_status'),
]