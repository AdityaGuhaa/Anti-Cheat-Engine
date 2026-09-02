"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs"; // 1. Import Clerk hooks
import Link from "next/link"; // 2. Import Link for dashboard navigation

export function LandingNavbar() {
  const navItems = [
    { name: "Product", link: "#product" },
    { name: "Solution", link: "#solution" },
    { name: "Pricing", link: "#pricing" },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSignedIn } = useAuth(); // 3. Check if user is logged in

  return (
    <div className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-8">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            
            {/* CONDITIONAL RENDERING BASED ON AUTH STATE */}
            {isSignedIn ? (
              <>
                <Link href="/dashboard">
                  <NavbarButton variant="secondary" className="text-muted-foreground hover:text-primary transition-colors text-[1rem]">
                    Dashboard
                  </NavbarButton>
                </Link>
                {/* User Profile Bubble */}
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                {/* Clerk Sign In Button wrapping your custom button */}
                <SignInButton mode="modal">
                  <NavbarButton variant="secondary" className="text-muted-foreground hover:text-primary transition-colors text-[1rem] cursor-pointer">
                    Login
                  </NavbarButton>
                </SignInButton>
                
                <NavbarButton variant="primary" className="bg-primary text-primary-foreground">
                  Book a call
                </NavbarButton>
              </>
            )}

          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            
            <div className="flex w-full flex-col gap-4 pt-4 border-t border-border">
              {isSignedIn ? (
                <>
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <NavbarButton variant="primary" className="w-full">
                      Go to Dashboard
                    </NavbarButton>
                  </Link>
                  <div className="flex justify-center pt-2">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <NavbarButton onClick={() => setIsMobileMenuOpen(false)} variant="secondary" className="w-full text-primary">
                      Login
                    </NavbarButton>
                  </SignInButton>
                  <NavbarButton onClick={() => setIsMobileMenuOpen(false)} variant="primary" className="w-full">
                    Book a call
                  </NavbarButton>
                </>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}