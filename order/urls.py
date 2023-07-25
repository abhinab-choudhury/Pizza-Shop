from django.urls import path
from . import views

app_name = "pizzaShop"
urlpatterns = [
    path("", views.index, name="index"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("register/", views.register, name="register"),
    path("menu/", views.menu, name="menu"),
    path("categorie/", views.categories, name="categories"),
]
