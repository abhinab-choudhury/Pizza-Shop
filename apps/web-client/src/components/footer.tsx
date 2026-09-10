import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <span className="text-2xl">🍕</span>
              Pinocchio&apos;s Pizza
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The best pizza in town, delivered fresh to your door.
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/product" className="hover:text-foreground transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-foreground transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>123 Pizza Street</li>
              <li>Foodville, CA 90210</li>
              <li>phone: (555) 123-4567</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Pinocchio&apos;s Pizza. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
