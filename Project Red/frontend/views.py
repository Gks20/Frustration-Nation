from django.shortcuts import render

# Create your views here.

def index(request):
    """Home page with login and skip to fishing options"""
    return render(request, "frontend/index.html")

def game(request):
    return render(request, "frontend/game.html")

def login(request):
    return render(request, "frontend/login.html")

def start(request):
    return render(request, "frontend/start.html")

'''
def function(request):
    return render(request, "frontend/filename.html")
'''
