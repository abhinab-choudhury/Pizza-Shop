"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ShoppingCart,
  User,
  LogOut,
  Package,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu whenever the route changes
  const nav = (href: string) => {
    if (pathname !== href) {
      setMobileOpen(false);
    }
    setMobileOpen(false);
  };

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex min-w-0 items-center gap-2 font-bold text-base sm:text-lg"
        >
          <span className="flex size-7 items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/pizza.svg" alt="" aria-hidden className="size-7" />
          </span>
          <span className="truncate">Pinocchio&apos;s Pizza</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/product"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Menu
          </Link>

          {isAuthenticated && (
            <Link
              href="/orders"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Orders
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            <Sun className="size-5 dark:hidden" />
            <Moon className="size-5 hidden dark:block" />
          </Button>

          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="size-5" />
              {itemCount > 0 && (
                <Badge className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full p-0 text-xs">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name || "User"}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/orders">
                    <Package className="mr-2 size-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 size-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            <Sun className="size-5 dark:hidden" />
            <Moon className="size-5 hidden dark:block" />
          </Button>

          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingCart className="size-5" />
              {itemCount > 0 && (
                <Badge className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full p-0 text-xs">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-background md:hidden">
          <nav className="container mx-auto flex flex-col gap-1 px-4 py-4">
            <Link
              href="/product"
              onClick={() => nav("/product")}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Menu
            </Link>

            {isAuthenticated && (
              <Link
                href="/orders"
                onClick={() => nav("/orders")}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Orders
              </Link>
            )}

            {isAuthenticated ? (
              <div className="mt-2 border-t pt-3">
                <div className="px-3 pb-2">
                  <p className="truncate text-sm font-medium">
                    {user?.name || "User"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 size-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button asChild className="mt-2 w-full">
                <Link href="/login" onClick={() => nav("/login")}>
                  Sign In
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}