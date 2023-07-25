from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.shortcuts import HttpResponse, HttpResponseRedirect, render
from django.urls import reverse
from django.shortcuts import render

from .models import *
# Create your views here.
def index(request):
   return render(request, 'pizza/index.html')
   # return HttpResponse("<h1> Hello World! Welcome to Pinocchio's Pizza & Subs</h1>")

def login_view(request):
   if request.method == 'POST':
      # required info
      Username = request.POST['Username']
      Password = request.POST['Password']
      user = authenticate(request, username=Username, password=Password)
      
      # Check if authentication successful
      if user is not None:
         login(request, user)
         return HttpResponseRedirect(reverse("pizzaShop:index"))
      else:
         messages.error(request, 'Invalid username and/or password.')
         return render(request,'pizza/login.html')
   else:
      return render(request, 'pizza/login.html')

def logout_view(request):
   logout(request)
   return HttpResponseRedirect(reverse('pizzaShop:index'))

def register(request):
   if request.method == 'POST':
      username = request.POST["username"]
      email =request.POST["email"]
      firstName = request.POST["FirstName"]
      lastName = request.POST["LastName"]
      
      # Ensure password matches with confirmation
      password = request.POST["password"]
      confirmation = request.POST["confirmation"]
      if password != confirmation:
         messages.error(request, "Passwords mush match")
         return render(request,'pizza/register.html')
      else:
         try:
            newUser = User.objects.create_user(password=password,username=username, email=email,first_name=firstName,last_name=lastName)
            newUser.save()
            login(request, newUser)
            return HttpResponseRedirect(reverse('pizzaShop:index'))
         except IntegrityError:
            messages.error(request,'Username already taken.')
            return render(request,'pizza/register.html')
   else:
      return render(request,'pizza/register.html')
   
def menu(request):
   menu = []
   pasta = list(Pasta.objects.all())
   subs = list(Sub.objects.filter(size = Size.objects.get(pk=1)))
   salad = list(Salad.objects.all())
   regular_pizza = list(Pizza.objects.filter(size = Size.objects.get(pk=1)))
   sicilian_pizza = list(Sicilian_Pizza.objects.filter(size = Size.objects.get(pk=1)))
   dinner = list(Dinner_Platter.objects.all())
   
   [menu.extend(type) for type in (pasta, subs, salad, regular_pizza, sicilian_pizza,dinner)]
    
   # Paginator
   pagination = Paginator(menu, 10)
   page_number = request.GET.get('page')
   Items = pagination.get_page(page_number)
      
   types = Menu.objects.all()
   sizes = Size.objects.all()
   return render(request, 'pizza/menu.html',{
      "Menu":Items,
      "Types": types,
      "dish_type":'All',
      "sizes": sizes,
   })   

def categories(request):
   
   menu=[]
   
   # Getting the Categories
   dish_type = request.GET['type']
   if(dish_type == 'Pasta'):
      menu = Pasta.objects.all()
   elif(dish_type == 'Subs'):
      menu = Sub.objects.filter(size = Size.objects.get(pk=1))
   elif(dish_type == 'Salads'):
      menu = Salad.objects.all()
   elif(dish_type == 'Sicilian Pizza'):
      menu = Sicilian_Pizza.objects.filter(size = Size.objects.get(pk=1))
   elif(dish_type == 'Dinner Platters'):
      menu = Dinner_Platter.objects.all()
   elif(dish_type == 'Regular Pizza'):
      menu = Pizza.objects.filter(size = Size.objects.get(pk=1))
   else:
      return HttpResponseRedirect(reverse('pizzaShop:menu'))
   
   # Paginator
   pagination = Paginator(menu, 10)
   page_number = request.GET.get('page')
   Items = pagination.get_page(page_number)
   
   types = list(Menu.objects.all())   
   context = {
      "Menu": Items,
      "Types": types,
      "dish_type":dish_type,
   }
   return render(request, 'pizza/menu.html',context) 