import { ReactNode } from "react";

import { cn } from "@/lib/utils";

import LaunchUI from "@/components/logos/launch-ui";
import {
  Footer,
  FooterBottom,
  FooterColumn,
  FooterContent,
} from "@/components/ui/footer";
import { ModeToggle } from "@/components/ui/mode-toggle";

interface FooterLink {
  text: string;
}

interface FooterColumnProps {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  logo?: ReactNode;
  name?: string;
  columns?: FooterColumnProps[];
  copyright?: string;
  policies?: FooterLink[];
  showModeToggle?: boolean;
  className?: string;
}

export default function FooterSection({
  logo = <LaunchUI />,
  name = "AlwaysAI",
  columns = [
    {
      title: "Product",
      links: [{ text: "Changelog" }, { text: "Documentation" }],
    },
    {
      title: "Company",
      links: [{ text: "About" }, { text: "Careers" }, { text: "Blog" }],
    },
    {
      title: "Contact",
      links: [{ text: "Discord" }, { text: "Twitter" }, { text: "Github" }],
    },
  ],
  copyright = "© 2025 Mikołaj Dobrucki. All rights reserved",
  policies = [{ text: "Privacy Policy" }, { text: "Terms of Service" }],
  showModeToggle = true,
  className,
}: FooterProps) {
  return (
    <footer className={cn("bg-background w-full px-4", className)}>
      <div className="max-w-container mx-auto pt-20">
        <Footer>
          {/* Added text-center here to center align all grid content */}
          <FooterContent className="text-center">
            {/* Logo Section */}
            <FooterColumn className="col-span-2 sm:col-span-3 md:col-span-1">
              {/* Added justify-center to center the logo horizontally */}
              <div className="flex items-center justify-center gap-2">
                {logo}
                <h3 className="text-xl font-bold">{name}</h3>
              </div>
            </FooterColumn>

            {/* Links Columns */}
            {columns.map((column, index) => (
              <FooterColumn key={index}>
                <h3 className="text-md pt-1 font-semibold">{column.title}</h3>
                {/* I added the links mapping here because it was missing in your original code */}
                <ul className="mt-4 space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <p className="text-sm text-muted-foreground hover:text-foreground">
                        {link.text}
                      </p>
                    </li>
                  ))}
                </ul>
              </FooterColumn>
            ))}
          </FooterContent>

          {/* Bottom Section */}
          <FooterBottom className="flex flex-col items-center gap-4 border-t pt-8 sm:flex-col justify-center">
            <div className="text-center text-sm text-muted-foreground">
              {copyright}
            </div>

            <div className="flex items-center justify-center gap-4">
              {policies.map((policy, index) => (
                <p
                  key={index}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {policy.text}
                </p>
              ))}
              {showModeToggle && <ModeToggle />}
            </div>
          </FooterBottom>
        </Footer>
      </div>
    </footer>
  );
}
