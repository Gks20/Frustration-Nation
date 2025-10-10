from django.shortcuts import render

# Create your views here.

def index(request):
    return render(request, "frontend/base.html")

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
