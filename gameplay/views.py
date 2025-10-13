from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import random

@csrf_exempt
def start_fishing(request):
    """API endpoint for starting fishing"""
    if request.method == 'POST':
        try:
            # Simulate fishing results
            fishing_result = {
                'success': True,
                'fish_caught': random.choice(['Salmon', 'Trout', 'Bass', 'Cod', 'Rare Golden Fish']),
                'coins_earned': random.randint(5, 25),
                'message': 'Great catch!'
            }
            return JsonResponse(fishing_result)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

@csrf_exempt  
def game_status(request):
    """API endpoint for game status"""
    return JsonResponse({
        'status': 'active',
        'version': '1.0',
        'features': ['fishing', 'store', 'inventory']
    })
