from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Size(models.Model):
    size = models.CharField(max_length=80)
    def __str__(self):
        return f"{self.size}"
 
class Pizza_Topping(models.Model):
    image = models.CharField(max_length=225,default="https://img.freepik.com/premium-vector/male-cook-cooking-meal-profile-avatar-icon_48369-15378.jpg")
    topping = models.CharField(max_length=60, blank=False,null=False)  
    
    def __str__(self):
        return f"{self.topping}"
 
class Subs_Topping(models.Model):
    topping = models.CharField(max_length=60, blank=False,null=False)  
    price = models.DecimalField(max_digits=6, decimal_places=2)
    
    def __str__(self):
        return f"{self.topping}for ${self.price}"    
    
class Menu(models.Model):
    type = models.CharField(max_length=80,blank=False,null=True)
    
    def __str__(self):
        return f"{self.type}"

#Regular Pizza
class Pizza(models.Model):
    name = models.CharField(max_length=30)
    image = models.CharField(max_length=225,default="https://img.freepik.com/premium-vector/male-cook-cooking-meal-profile-avatar-icon_48369-15378.jpg")
    size = models.ForeignKey(Size, on_delete=models.PROTECT, null=False, blank=False)
    toppings = models.ManyToManyField(Pizza_Topping)
    price = models.DecimalField(decimal_places=2,max_digits=6)
    description = models.TextField(max_length=225,default="This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.")
    rating= models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return f"{self.name}({self.size}) for ${self.price}"
 
#Sicilian Pizza
class Sicilian_Pizza(models.Model):
    name = models.CharField(max_length=30)
    image = models.CharField(max_length=225,default="https://img.freepik.com/premium-vector/male-cook-cooking-meal-profile-avatar-icon_48369-15378.jpg")
    size = models.ForeignKey(Size, on_delete=models.PROTECT, null=False, blank=False)
    toppings = models.ManyToManyField(Pizza_Topping)
    price = models.DecimalField(decimal_places=2,max_digits=6)
    description = models.TextField(max_length=225,default="This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.")
    rating= models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return f"{self.name}({self.size}) for ${self.price}"
   
# Subs             
class Sub(models.Model):
    name = models.CharField(max_length=30)
    image = models.CharField(max_length=225,default="https://img.freepik.com/premium-vector/male-cook-cooking-meal-profile-avatar-icon_48369-15378.jpg")
    size = models.ForeignKey(Size, on_delete=models.PROTECT, null=False, blank=False)
    toppings = models.ManyToManyField(Subs_Topping)
    price = models.DecimalField(decimal_places=2,max_digits=6)
    description = models.TextField(max_length=225,default="This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.")
    rating= models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return f"{self.name}({self.size}) for ${self.price}"

# Patsa
class Pasta(models.Model):
    name = models.CharField(max_length=30,blank=False,null=False)
    image = models.CharField(max_length=225,default="https://img.freepik.com/premium-vector/male-cook-cooking-meal-profile-avatar-icon_48369-15378.jpg")
    price = models.DecimalField(decimal_places=2,max_digits=6)
    description = models.TextField(max_length=225,default="This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.")
    rating= models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return f"{self.name} for ${self.price}"

# Salad
class Salad(models.Model):
    name = models.CharField(max_length=30)
    image = models.CharField(max_length=225,default="https://img.freepik.com/premium-vector/male-cook-cooking-meal-profile-avatar-icon_48369-15378.jpg")
    price = models.DecimalField(decimal_places=2,max_digits=6)
    description = models.TextField(max_length=225,default="This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.")
    rating= models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return f"{self.name} for ${self.price}"

# Dinner Platter
class Dinner_Platter(models.Model):
    name = models.CharField(max_length=30)
    image = models.CharField(max_length=225,default="https://img.freepik.com/premium-vector/male-cook-cooking-meal-profile-avatar-icon_48369-15378.jpg")
    price_small = models.DecimalField(decimal_places=2,max_digits=6)
    price_large = models.DecimalField(decimal_places=2,max_digits=6)
    description = models.TextField(max_length=225,default="This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.")
    rating= models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return f"{self.name} for small: ${self.price_large}, large ${self.price_large}"

#Order
class Order(models.Model):
    item = models.IntegerField(default= 0)
    image = models.CharField(max_length=225,default="https://img.freepik.com/premium-vector/male-cook-cooking-meal-profile-avatar-icon_48369-15378.jpg")    
    owner = models.ForeignKey(User, on_delete=models.CASCADE,related_name="Buyer", blank=False, null=False)
    price = models.DecimalField(max_digits=6,decimal_places=2, default=0)
    size = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.owner} order a {self.size} Pizza with {self.topings}" 

# Cart
class Cart(models.Model):
    order_id = models.IntegerField()
    item = models.CharField(max_length=25)
    price = models.DecimalField(decimal_places=2, max_digits=6)     
    image = models.CharField(max_length=225,default="https://img.freepik.com/premium-vector/male-cook-cooking-meal-profile-avatar-icon_48369-15378.jpg")
    cutomer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="cutomer", null=False,blank=False)
    ordered_at = models.DateTimeField(auto_created=True)
    delivery = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.order_id}. {self.cutomer}  ==> Item {self.item} and Price{self.price}."    
    
    