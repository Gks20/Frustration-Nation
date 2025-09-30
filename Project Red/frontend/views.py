from django.shortcuts import render

# Create your views here.

def index(request):
    return render(request, "frontend/base.html")

def examples(request):
    return render(request, "frontend/ui_examples.html")

def login(request):
    return render(request, "frontend/login.html")

'''
def function(request):
    return render(request, "frontend/filename.html")
'''
