import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin,
  Clock,
  Phone,
  ChevronRight,
  Users,
  ArrowRight,
  Heart,
  Award,
  Pizza,
} from 'lucide-react';
import HeroImage from '@/assets/hero-image.webp';
import Grubhub from '@/assets/grubhub.png';
import Doordash from '@/assets/doordash.png';
import UberEats from '@/assets/uber-eats.svg';
import PizzaIcon from '@/assets/icons-pizza.png';
import SubsIcon from '@/assets/icons-subs.png';
import SlidersIcon from '@/assets/icons-sliders.png';
import ShopBuilding from '@/assets/building.jpg';
import PizzaImage from "@/assets/pizza-image.png";

function Index() {
  // Menu data
  const menuCategories = {
    pizza: [
      {
        name: 'Classic Margherita',
        description: 'Fresh mozzarella, tomato sauce, basil',
        price: '$14.99',
        popular: true,
        image: 'https://picsum.photos/120/120',
      },
      {
        name: 'Pepperoni',
        description: 'Pepperoni, mozzarella, tomato sauce',
        price: '$16.99',
        popular: true,
        image: 'https://picsum.photos/120/120',
      },
      {
        name: 'Vegetarian',
        description: 'Bell peppers, onions, mushrooms, olives',
        price: '$17.99',
        image: 'https://picsum.photos/120/120',
      },
      {
        name: 'Meat Lovers',
        description: 'Pepperoni, sausage, bacon, ham',
        price: '$19.99',
        popular: true,
        image: 'https://picsum.photos/120/120',
      },
    ],
    subs: [
      {
        name: 'Italian Sub',
        description: 'Salami, ham, provolone, lettuce, tomato',
        price: '$10.99',
        popular: true,
        image: 'https://picsum.photos/120/120',
      },
      {
        name: 'Meatball Sub',
        description: 'Homemade meatballs, marinara, mozzarella',
        price: '$11.99',
        popular: true,
        image: 'https://picsum.photos/120/120',
      },
      {
        name: 'Turkey Club',
        description: 'Turkey, bacon, lettuce, tomato, mayo',
        price: '$10.99',
        image: 'https://picsum.photos/120/120',
      },
      {
        name: 'Veggie Sub',
        description: 'Assorted vegetables, provolone, vinaigrette',
        price: '$9.99',
        image: 'https://picsum.photos/120/120',
      },
    ],
    sides: [
      {
        name: 'Garlic Knots',
        description: 'Freshly baked, brushed with garlic butter',
        price: '$5.99',
        popular: true,
        image: 'https://picsum.photos/120/120',
      },
      {
        name: 'Mozzarella Sticks',
        description: 'Breaded mozzarella with marinara sauce',
        price: '$7.99',
        popular: true,
        image: 'https://picsum.photos/120/120',
      },
      {
        name: 'Caesar Salad',
        description: 'Romaine, croutons, parmesan, Caesar dressing',
        price: '$8.99',
        image: 'https://picsum.photos/120/120',
      },
      {
        name: 'Buffalo Wings',
        description: 'Spicy buffalo wings with blue cheese dip',
        price: '$11.99',
        image: 'https://picsum.photos/120/120',
      },
    ],
  };

  // Special Deals data
  const specialDeals = [
    {
      title: 'Family Feast',
      description: '2 large pizzas, garlic knots, and 2L soda',
      price: '$39.99',
      originalPrice: '$52.96',
      code: 'FAMILY25',
    },
    {
      title: 'Lunch Special',
      description: 'Any 8" sub, side & drink',
      price: '$12.99',
      originalPrice: '$16.97',
      code: 'LUNCH20',
    },
    {
      title: 'Game Day Bundle',
      description: 'XL pizza, 12 wings & breadsticks',
      price: '$32.99',
      originalPrice: '$41.97',
      code: 'GAMEDAY',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Enhanced */}
      <section className="relative h-[75vh] overflow-hidden">
        <img
          src={HeroImage}
          alt="Pinocchio's Pizza & Subs"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative container mx-auto h-full flex flex-col justify-center items-start px-4">
          <div className="inline-block bg-red-900 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
            Authentic Italian Since 1982
          </div>
          <h1 className="font-bold text-white mb-4">
            <span className="text-4xl md:text-6xl">Pinocchio's</span>
            <br />
            <span className="text-6xl md:text-8xl">Pizza & Subs</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-8">
            Handcrafted pizzas and subs made with the freshest ingredients, delivered to your door
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-red-600 hover:bg-red-600/80 text-black">
              Order Online <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-black border-white hover:bg-white/80"
            >
              View Menu
            </Button>
          </div>
        </div>
      </section>

      {/* Delivery Partners Section - Fixed and Enhanced */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-screen-xl px-4 mx-auto">
          <div className="grid grid-cols-3 gap-8 items-center justify-items-center">
            <div className="flex items-center justify-center h-16">
              <img src={Doordash} className="aspect-auto w-50" />
            </div>
            <div className="flex items-center justify-center h-16">
              <img src={Grubhub} className="aspect-auto w-50" />
            </div>
            <div className="flex items-center justify-center h-16">
              <img src={UberEats} className="aspect-auto w-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Special Deals - New Component */}
      <section className="bg-gradient-to-r from-red-50 to-orange-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-red-600 font-semibold">SPECIAL OFFERS</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Hot Deals & Discounts</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Take advantage of our limited-time offers and save on your favorite dishes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {specialDeals.map((deal, index) => (
              <Card key={index} className="overflow-hidden border-none shadow-md">
                <div className="bg-gradient-to-r from-red-600 to-orange-500 p-2 text-white font-semibold text-center">
                  SAVE UP TO{' '}
                  {Math.round(
                    ((parseFloat(deal.originalPrice.substring(1)) -
                      parseFloat(deal.price.substring(1))) /
                      parseFloat(deal.originalPrice.substring(1))) *
                      100,
                  )}
                  %
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2">{deal.title}</h3>
                  <p className="text-gray-600 mb-4">{deal.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-2xl font-bold text-red-600">{deal.price}</span>
                      <span className="text-gray-400 line-through text-sm ml-2">
                        {deal.originalPrice}
                      </span>
                    </div>
                    <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full">
                      Code: {deal.code}
                    </span>
                  </div>
                  <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                    Order Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Section - Improved */}
      <section id="menu" className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <span className="text-red-600 font-semibold">OUR MENU</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Delicious Options</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our wide selection of handcrafted pizzas, fresh subs, and Italian specialties
              made with premium ingredients.
            </p>
          </div>

          <Tabs defaultValue="pizza" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid gap-1.5 w-fit h-full grid-cols-3 p-4 mb-8 bg-gray-100">
              <TabsTrigger
                value="pizza"
                className="data-[state=active]:bg-red-500 cursor-pointer data-[state=active]:text-white"
              >
                <img src={PizzaIcon} className="w-6" />
              </TabsTrigger>
              <TabsTrigger
                value="subs"
                className="data-[state=active]:bg-red-500 cursor-pointer data-[state=active]:text-white"
              >
                <img src={SubsIcon} className="w-6" />
              </TabsTrigger>
              <TabsTrigger
                value="sides"
                className="data-[state=active]:bg-red-500 cursor-pointer data-[state=active]:text-white"
              >
                <img src={SlidersIcon} className="w-6" />
              </TabsTrigger>
            </TabsList>

            {Object.entries(menuCategories).map(([category, items]) => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {items.map((item, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-l-red-500"
                    >
                      <div className="flex p-4">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center">
                            <h3 className="font-bold text-lg">{item.name}</h3>
                            {item.popular && (
                              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                          <p className="font-bold text-red-600">{item.price}</p>
                          <Button size="sm" className="mt-2 bg-red-500 hover:bg-red-600 text-white">
                            Add to Order
                          </Button>
                        </div>
                        <div className="relative h-24 w-24 rounded-md overflow-hidden">
                          <img
                            src={item.image || 'https://picsum.photos/120/120'}
                            alt={item.name}
                            className="object-cover h-full w-full"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <Button
                    variant="outline"
                    className="gap-2 border-red-500 text-red-500 hover:bg-red-50"
                  >
                    View Full Menu <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* "Why Choose Us" Section - New Component */}
      <section className="bg-red-50 py-20 relative overflow-hidden">
        <img src={PizzaImage} alt='' className='absolute w-40 md:w-72 -mt-30 -ml-20' />
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-4 rounded-full">
                <Pizza className="h-10 w-10 text-red-600" />
              </div>
            </div>
            <span className="text-red-600 font-semibold tracking-wide uppercase">
              Why Choose Us
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-2 mb-4 text-gray-800">
              The Pinocchio's Difference
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              What makes our pizza and subs stand out from the rest
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                Icon: Award,
                title: 'Premium Ingredients',
                text: 'Fresh, locally-sourced ingredients for the best flavor in every bite.',
              },
              {
                Icon: Users,
                title: 'Family Recipes',
                text: 'Authentic Italian recipes passed down through generations.',
              },
              {
                Icon: Clock,
                title: 'Fast Service',
                text: 'Quick preparation and delivery without compromising quality.',
              },
              {
                Icon: Heart,
                title: 'Made with Love',
                text: 'Passion for pizza-making that you can taste in every slice.',
              },
            ].map(({ Icon, title, text }, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all text-center border border-red-100"
              >
                <div className="bg-red-100 p-4 rounded-full inline-flex justify-center items-center mb-6">
                  <Icon className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-800">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Background Decoration Shapes */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-red-100 rounded-full opacity-30 blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-yellow-100 rounded-full opacity-20 blur-2xl translate-x-1/3 translate-y-1/3"></div>
      </section>

      {/* Location & Hours - Improved */}
      <section id="location" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-7xl mx-auto">
            <div>
              <span className="text-red-600 font-semibold">VISIT US</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">Come Say Hello</h2>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-red-600 flex-shrink-0" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Address</h3>
                    <p className="text-gray-600">
                      123 Main Street
                      <br />
                      Anytown, ST 12345
                    </p>
                    <Button variant="link" className="p-0 h-auto mt-1 text-red-600">
                      Get Directions
                    </Button>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-red-600 flex-shrink-0" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Hours</h3>
                    <div className="grid grid-cols-2 gap-2 text-gray-600">
                      <span>Monday - Thursday:</span>
                      <span>11:00 AM - 10:00 PM</span>
                      <span>Friday - Saturday:</span>
                      <span>11:00 AM - 11:00 PM</span>
                      <span>Sunday:</span>
                      <span>12:00 PM - 9:00 PM</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-red-600 flex-shrink-0" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Contact</h3>
                    <p className="text-gray-600">
                      Phone:{' '}
                      <a href="tel:5551234567" className="hover:underline">
                        (555) 123-4567
                      </a>
                      <br />
                      Email:{' '}
                      <a href="mailto:info@pinocchiospizza.com" className="hover:underline">
                        info@pinocchiospizza.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8 space-x-4">
                <Button className="bg-red-500 hover:bg-red-600 text-white">Order Now</Button>
                <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
                  Call Us
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-md">
              <img src={ShopBuilding} alt="Map" className="object-contain w-full h-full" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                <p className="font-bold text-lg">Pinocchio's Pizza & Subs</p>
                <p className="text-sm">123 Main Street, Anytown, ST 12345</p>
                <Button size="sm" className="mt-2 bg-red-500 hover:bg-red-600 text-white">
                  Open in Maps
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-6xl">
  <form action="" className="form bg-white p-6 my-10 relative shadow-md rounded-lg">
    <div
      className="icon bg-red-600 text-white w-6 h-6 absolute flex items-center justify-center p-5"
      style={{ left: '-20px'}}
    >
      <i className="fal fa-phone-volume fa-fw text-2xl transform -rotate-45"></i>
    </div>
    <h3 className="text-2xl text-gray-900 font-extrabold mb-1">Let us call you!</h3>
    <p className="text-gray-600 mb-4">We’ll get back to you as soon as possible.</p>
    
    <div className="flex flex-col md:flex-row md:space-x-5 space-y-3 md:space-y-0">
      <input
        type="text"
        placeholder="Your Name"
        className="border border-gray-300 rounded-md p-3 w-full"
      />
      <input
        type="tel"
        placeholder="Your Number"
        className="border border-gray-300 rounded-md p-3 w-full"
      />
    </div>

    <input
      type="email"
      placeholder="Your Email"
      className="border border-gray-300 rounded-md p-3 w-full mt-4"
    />
    
    <textarea
      cols={10}
      rows={3}
      placeholder="Tell us about your order or request"
      className="border border-gray-300 rounded-md p-3 w-full mt-4"
    ></textarea>

    <p className="font-bold text-sm mt-4">GDPR Agreement *</p>
    <div className="flex items-start space-x-2 mt-2">
      <input type="checkbox" className="mt-1" />
      <p className="text-gray-600 text-sm">
        I consent to having this website store my submitted information so they can respond to
        my inquiry.
      </p>
    </div>

    <input
      type="submit"
      value="Submit"
      className="w-full mt-6 bg-red-600 hover:bg-red-500 text-white font-semibold p-3 rounded-md transition-all duration-300"
    />
  </form>
</section>

    </div>
  );
}

export default Index;
