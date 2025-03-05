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

def SicilianPizza_vs_RegularPizza(request):
   return render(request, 'pizza/SicilianPizza_vs_RegularPizza.html')   

def Directions(request):
   return render(request, 'pizza/Directions.html')

def Hours(request):
   return render(request,'pizza/Hours.html')


def Menu(request):
   if request.method == "POST":
      pass
   else:
      S_Dishes = Dish.objects.filter(size = Size.objects.get(pk=1))
      # L_Dishes = Dish.objects.filter(size = Size.objects.get(pk=2))
      # AllDishes = Dish.objects.all()
      
      return render(request,'pizza/menu.html',{
         "Dishes":S_Dishes,
         "Toppings": Topping.objects.all(),
         "Sizes": Size.objects.all() 
      })

def size_field(request):
   if request.method == "POST":
      if request.POST['size'] == 'Small':
         S_Dishes = Dish.objects.filter(size = Size.objects.get(pk=1))
         context = {
            "Dishes":S_Dishes,
            "Toppings": Topping.objects.all(),
            "Sizes": Size.objects.all() 
         }
         return render(request,'pizza/menu.html',context)
      elif request.POST['size'] == 'Large':         
         L_Dishes = Dish.objects.filter(size = Size.objects.get(pk=2))
         context = {
            "Dishes":L_Dishes,
            "Toppings": Topping.objects.all(),
            "Sizes": Size.objects.all() 
         }
         return render(request,'pizza/menu.html',context)
      else:
         pass
   else:
      pass
   
def order(request):
   if request.method == "POST":
      name = request.POST["item_name"]
      price = request.POST["item_price"]
      category = request.POST["category"]
      image = request.POST["image"]
      size = request.POST["size"]
      
      topping_cnt = 0
      first_char = name[0]
      if(first_char.isdigit()):
         topping_cnt = int(name[0])
      
      topping = []
      try:
         for cnt in range(1,topping_cnt+1):
            t = [request.POST[f"Topping{cnt}"]]
            topping.extend(t)
      except:
         topping = []

      dish = Dish.objects.filter(size = Size.objects.get(name=size))
      context = {
         "Dishes":dish,
         "Toppings": Topping.objects.all(),
         "Sizes": Size.objects.all() 
      }
      print("Dishes",dish)
      print("topping",topping)
      print("Price",price)
      print("category",category)
      
      new_order = Order(
         user = request.user,
         name=name,
         category=category,
         image=image,
         size=Size.objects.get(name=size),
         price=price,
         topping=topping
      )
      new_order.save()
      
      return render(request,'pizza/menu.html',context)



# def menu(request,size):
#    menu = []
#    pasta = list(Pasta.objects.all())
#    subs = list(Sub.objects.filter(sizes = Size.objects.get(size=size)))
#    salad = list(Salad.objects.all())
#    regular_pizza = list(Pizza.objects.filter(sizes = Size.objects.get(size=size)))
#    sicilian_pizza = list(Sicilian_Pizza.objects.filter(sizes = Size.objects.get(size=size)))
#    dinner = list(Dinner_Platter.objects.filter(sizes = Size.objects.get(size=size)))
   
#    [menu.extend(type) for type in (pasta, subs, salad, regular_pizza, sicilian_pizza,dinner)]
    
#    # Paginator
#    pagination = Paginator(menu, 10)
#    page_number = request.GET.get('page')
#    Items = pagination.get_page(page_number)
      
#    types = Menu.objects.all()
#    pizza_topping = Pizza_Topping.objects.all()
#    context={
#       "Menu":Items,
#       "Types": types,
#       "pizza_topping":pizza_topping,
#       "dish_type":'All',
#    }
#    return render(request, 'pizza/menu.html',context)   

# def categories(request,size):
   
#    menu=[]
   
#    # Getting the Categories
#    dish_type = request.GET['type']
#    if(dish_type == 'Pasta'):
#       menu = Pasta.objects.all()
#    elif(dish_type == 'Subs'):
#       menu = Sub.objects.filter(sizes = Size.objects.get(size=size))
#    elif(dish_type == 'Salads'):
#       menu = Salad.objects.all()
#    elif(dish_type == 'Sicilian Pizza'):
#       menu = Sicilian_Pizza.objects.filter(sizes = Size.objects.get(size=size))
#    elif(dish_type == 'Dinner Platters'):
#       menu = Dinner_Platter.objects.all()
#    elif(dish_type == 'Regular Pizza'):
#       menu = Pizza.objects.filter(sizes = Size.objects.get(size=size))
#    elif(dish_type == 'All'): 
#       pasta = list(Pasta.objects.all())
#       subs = list(Sub.objects.filter(sizes = Size.objects.get(size=size)))
#       salad = list(Salad.objects.all())
#       regular_pizza = list(Pizza.objects.filter(sizes = Size.objects.get(size=size)))
#       sicilian_pizza = list(Sicilian_Pizza.objects.filter(sizes = Size.objects.get(size=size)))
#       dinner = list(Dinner_Platter.objects.all())
      
#       [menu.extend(type) for type in (pasta, subs, salad, regular_pizza, sicilian_pizza,dinner)]
   
#    else:
#       pass
   
#    # Paginator
#    pagination = Paginator(menu, 10)
#    page_number = request.GET.get('page')
#    Items = pagination.get_page(page_number)
   
#    types = Menu.objects.all()
#    pizza_topping = Pizza_Topping.objects.all()
#    context={
#       "Menu":Items,
#       "Types": types,
#       "pizza_topping":pizza_topping,
#       "dish_type":dish_type,
#    }
#    return render(request, 'pizza/menu.html',context) 