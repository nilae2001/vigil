"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../components/ui/navigation-menu";
import { Button } from "../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "../components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { title: "Dashboard", href: "/" },
    { title: "Endpoints", href: "/endpoints" },
    { title: "Incidents", href: "/incidents" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur px-5">
      <div className="container flex h-16 items-center justify-between font-sans">
        <a href="/" className="shrink-0">
          <img
            src="/vigil.png"
            alt="Vigil Logo"
            className="h-10 w-auto object-contain"
          />
        </a>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-6">
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.title}>
                <NavigationMenuLink
                  href={link.href}
                  className="text-sm font-medium"
                >
                  {link.title}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex">
            <Show when="signed-in">
              <UserButton />
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="default" className="rounded-md">
                  Login
                </Button>
              </SignInButton>
            </Show>
          </div>

          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="pr-0">
                <VisuallyHidden.Root>
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>
                    Access the main pages of the Vigil application.
                  </SheetDescription>
                </VisuallyHidden.Root>
                <div className="flex flex-col gap-4 mt-10 p-6">
                  {navLinks.map((link) => (
                    <a
                      key={link.title}
                      href={link.href}
                      className="text-lg font-semibold"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.title}
                    </a>
                  ))}
                  <hr className="my-2 mr-6" />
                  <Show when="signed-in">
                    <div className="flex items-center gap-3">
                      <UserButton />
                      <span className="text-sm text-muted-foreground">
                        Account
                      </span>
                    </div>
                  </Show>
                  <Show when="signed-out">
                    <SignInButton mode="modal">
                      <Button
                        className="w-[90%]"
                        onClick={() => setIsOpen(false)}
                      >
                        Login
                      </Button>
                    </SignInButton>
                  </Show>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
