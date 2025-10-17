from django.shortcuts import render

def storefront(request):
    """Store front page view"""
    return render(request, 'store/storefront.html')
