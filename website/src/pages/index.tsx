import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Clock, Phone, ChevronRight } from "lucide-react"

function Index() {
  return (
    <div className="border-y min-h-screen">
      <main>
        {/* Menu Section */}
        <section id="menu" className="bg-muted py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Menu</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore our wide selection of handcrafted pizzas, fresh subs, and Italian specialties.
              </p>
            </div>

            <Tabs defaultValue="pizza" className="w-full max-w-4xl mx-auto">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="pizza">Pizza</TabsTrigger>
                <TabsTrigger value="subs">Subs</TabsTrigger>
                <TabsTrigger value="sides">Sides</TabsTrigger>
              </TabsList>
              <TabsContent value="pizza" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      name: "Classic Margherita",
                      description: "Fresh mozzarella, tomato sauce, basil",
                      price: "$14.99",
                      image: "/placeholder.svg?height=120&width=120",
                    },
                    {
                      name: "Pepperoni",
                      description: "Pepperoni, mozzarella, tomato sauce",
                      price: "$16.99",
                      image: "/placeholder.svg?height=120&width=120",
                    },
                    {
                      name: "Vegetarian",
                      description: "Bell peppers, onions, mushrooms, olives",
                      price: "$17.99",
                      image: "/placeholder.svg?height=120&width=120",
                    },
                    {
                      name: "Meat Lovers",
                      description: "Pepperoni, sausage, bacon, ham",
                      price: "$19.99",
                      image: "/placeholder.svg?height=120&width=120",
                    },
                  ].map((item, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="flex p-4">
                        <div className="flex-1 pr-4">
                          <h3 className="font-bold text-lg">{item.name}</h3>
                          <p className="text-muted-foreground text-sm mb-2">{item.description}</p>
                          <p className="font-bold text-primary">{item.price}</p>
                        </div>
                        <div className="relative h-24 w-24 rounded-md overflow-hidden">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={120}
                            height={120}
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <Button variant="outline" className="gap-2">
                    View Full Menu <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="subs" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      name: "Italian Sub",
                      description: "Salami, ham, provolone, lettuce, tomato",
                      price: "$10.99",
                      image: "/placeholder.svg?height=120&width=120",
                    },
                    {
                      name: "Meatball Sub",
                      description: "Homemade meatballs, marinara, mozzarella",
                      price: "$11.99",
                      image: "/placeholder.svg?height=120&width=120",
                    },
                    {
                      name: "Turkey Club",
                      description: "Turkey, bacon, lettuce, tomato, mayo",
                      price: "$10.99",
                      image: "/placeholder.svg?height=120&width=120",
                    },
                    {
                      name: "Veggie Sub",
                      description: "Assorted vegetables, provolone, vinaigrette",
                      price: "$9.99",
                      image: "/placeholder.svg?height=120&width=120",
                    },
                  ].map((item, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="flex p-4">
                        <div className="flex-1 pr-4">
                          <h3 className="font-bold text-lg">{item.name}</h3>
                          <p className="text-muted-foreground text-sm mb-2">{item.description}</p>
                          <p className="font-bold text-primary">{item.price}</p>
                        </div>
                        <div className="relative h-24 w-24 rounded-md overflow-hidden">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={120}
                            height={120}
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <Button variant="outline" className="gap-2">
                    View Full Menu <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="sides" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      name: "Garlic Knots",
                      description: "Freshly baked, brushed with garlic butter",
                      price: "$5.99",
                      image: "/placeholder.svg?height=120&width=120",
                    },
                    {
                      name: "Mozzarella Sticks",
                      description: "Breaded mozzarella with marinara sauce",
                      price: "$7.99",
                      image: "/placeholder.svg?height=120&width=120",
                    },
                    {
                      name: "Caesar Salad",
                      description: "Romaine, croutons, parmesan, Caesar dressing",
                      price: "$8.99",
                      image: "/placeholder.svg?height=120&width=120",
                    },
                    {
                      name: "Buffalo Wings",
                      description: "Spicy buffalo wings with blue cheese dip",
                      price: "$11.99",
                      image: "/placeholder.svg?height=120&width=120",
                    },
                  ].map((item, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="flex p-4">
                        <div className="flex-1 pr-4">
                          <h3 className="font-bold text-lg">{item.name}</h3>
                          <p className="text-muted-foreground text-sm mb-2">{item.description}</p>
                          <p className="font-bold text-primary">{item.price}</p>
                        </div>
                        <div className="relative h-24 w-24 rounded-md overflow-hidden">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={120}
                            height={120}
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <Button variant="outline" className="gap-2">
                    View Full Menu <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Location & Hours */}
        <section id="location" className="py-16 container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Location & Hours</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Address</h3>
                    <p className="text-muted-foreground">
                      123 Main Street
                      <br />
                      Anytown, ST 12345
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Hours</h3>
                    <div className="grid grid-cols-2 gap-2 text-muted-foreground">
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
                  <Phone className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Contact</h3>
                    <p className="text-muted-foreground">
                      Phone: (555) 123-4567
                      <br />
                      Email: info@pinocchiospizza.com
                    </p>
                  </div>
                </div>
              </div>
              <Button className="mt-8">Order Now</Button>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <img
                src="/placeholder.svg?height=400&width=600"
                alt="Map"
                width={600}
                height={400}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Order?</h2>
            <p className="text-lg max-w-2xl mx-auto mb-8">
              Experience the authentic taste of Pinocchio's Pizza & Subs. Order online for pickup or delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Call Now: (555) 123-4567
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Order Online
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Index

