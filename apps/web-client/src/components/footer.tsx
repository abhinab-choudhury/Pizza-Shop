import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/pizza.svg" alt="" aria-hidden className="size-6" />
              Pinocchio&apos;s Pizza
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Fresh, handcrafted pizza — take-away only, hot and ready at our
              counter.
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
            <h4 className="mb-3 font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="hover:text-foreground transition-colors">
                  Refund &amp; Cancellation
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>14, MG Road, Bengaluru, Karnataka 560001</li>
              <li>
                <a
                  href="tel:+919876543210"
                  className="hover:text-foreground transition-colors"
                >
                  +91 98765 43210
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@pinocchiospizza.in"
                  className="hover:text-foreground transition-colors"
                >
                  support@pinocchiospizza.in
                </a>
              </li>
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
