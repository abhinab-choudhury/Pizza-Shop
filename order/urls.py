from django.urls import path
from . import views

app_name = "pizzaShop"
urlpatterns = [
    path("", views.index, name="index"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("register/", views.register, name="register"),
    path("SicilianPizza_vs_RegularPizza/",views.SicilianPizza_vs_RegularPizza,name="SicilianPizza_vs_RegularPizza"),
    path("Directions/",views.Directions,name="Directions"),
    path("Hours/",views.Hours,name="Hours"),
    path("menu/",views.Menu, name="menu"),
    path("size_field/",views.size_field,name="size_field"),
    path("order/",views.order,name="order"),
    # path("menu/<str:size>", views.menu, name="menu"),
    # path("categorie/<str:size>", views.categories, name="categories"),
]
