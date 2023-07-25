from django.contrib import admin
from order.models import *
# Register your models here.

admin.site.register(User)
admin.site.register([Menu,Size,Order,Cart,])
admin.site.register([Pizza, Sicilian_Pizza, Sub, Pasta, Salad, Dinner_Platter])
admin.site.register([Pizza_Topping,Subs_Topping])
