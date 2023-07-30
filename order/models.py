from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

# Sizes
class Size(models.Model):
    name = models.CharField(verbose_name="Size Name",max_length=255)
    
    class Meta():
        verbose_name_plural = "Sizes"

    def __str__(self):
        return self.name
    
# Categories    
class Category(models.Model):
    name = models.CharField(verbose_name="Type",max_length=255,db_index=True)
    
    class Meta:
        verbose_name_plural = 'Catergories'
        
    def __str__(self):
        return self.name

# Toppings
def default_type():
    """
    Getting a Default Value:
    create new status if not avilable
    Returns:
        Category: category_object
    """
    return Category.objects.get_or_create(name="None")[0]
              
class Topping(models.Model):
    name = models.CharField(verbose_name="Toppping Name",max_length=255,blank=False)
    category = models.ManyToManyField(Category,verbose_name="Type of Dish",blank=True,default="None")
    price = models.DecimalField(verbose_name="Price",max_digits=5, decimal_places=2)
    
    def __str__(self):
        return f"{self.name}({self.category}) for ${self.price}"
 
# all the avilable dishes
class Dish(models.Model):
    name = models.CharField(verbose_name="Name of the Dish",max_length=50, blank=False)
    category = models.ForeignKey(Category,verbose_name="Type of Dish",blank=False, on_delete=models.CASCADE)
    image = models.URLField(verbose_name="Image URL",max_length=255, default="https://i.redd.it/xgw4znhmt4t51.jpg")
    size = models.ForeignKey(Size,verbose_name="Size", on_delete=models.CASCADE, blank=True,related_name="item_size")
    topping_cnt= models.IntegerField(verbose_name="Number of Toppings: ",default=0)
    price = models.DecimalField(verbose_name="Price",max_digits=5, decimal_places=2)
    
     
    class Meta:
        verbose_name_plural = "Dishes"
    
    def __str__(self):
        return f"{self.name}({self.category}):{self.size} for {self.price}"    
    
class Order(models.Model):
    user = models.ForeignKey(User, verbose_name="User", on_delete=models.CASCADE) 
    name = models.CharField(verbose_name="Dish Name",max_length=255)
    category = models.CharField(max_length=255, verbose_name="Dish Type")
    image = models.URLField(verbose_name="Image URL",max_length=255, default="https://i.redd.it/xgw4znhmt4t51.jpg")
    size = models.ForeignKey(Size, verbose_name="Size of the Ordered Dish: ", on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=5,decimal_places=2)
    topping = models.CharField(max_length=255, verbose_name="Included Topping",default="None")
    ordered_at = models.DateField(verbose_name="Time", auto_now_add=True)
    
    class Meta:
        get_latest_by="user"
        
    def __str__(self):
        return f"{self.user} orderd {self.name}({self.category}) for ({self.price})"
    