from django.contrib import admin
from order.models import *
# Register your models here.

admin.site.register(User)
admin.site.register([Dish, Category, Size,Topping,Order])

