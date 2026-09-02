import { User, Users } from "lucide-react";

import { cn } from "@/lib/utils";

import { PricingColumn, PricingColumnProps } from "@/components/ui/pricing-column";

interface PricingProps {
  title?: string | false;
  description?: string | false;
  plans?: PricingColumnProps[] | false;
  className?: string;
}

export default function Pricing({
  title = "Build your dream landing page, today.",
  description = "Get lifetime access to all the components. No recurring fees. Just simple, transparent pricing.",
  plans = [
    {
      name: "Free",
      description: "For everyone starting out",
      price: 0,
      priceNote: "Free and open-source. Get started now.",
      cta: {
        variant: "glow",
        label: "Get started for free",
        href: "/docs/getting-started/introduction",
      },
      features: [
        "1 examination",
        "9 students upto",
        "1 question generation",
      ],
      variant: "default",
      className: "hidden lg:flex",
    },
    {
      name: "Pro",
      icon: <User className="size-4" />,
      description: "For early-stage University, solopreneurs and small Institution",
      price: 149,
      priceNote: "Lifetime access. Free updates. No recurring fees.",
      cta: {
        variant: "default",
        label: "Get all-access",
        href: "",
      },
      features: [
        `100 exams a year`,
        `100 students per exam`,
        `Infinite Question Generation`,
        `Infinite Mail Generation`,
      ],
      variant: "glow-brand",
    },
    {
      name: "Max",
      icon: <Users className="size-4" />,
      description: "For teams and agencies working on examining their candidates",
      price: 749,
      priceNote: "Lifetime access. Free updates. No recurring fees.",
      cta: {
        variant: "default",
        label: "Get all-access for your team",
        href: "",
      },
      features: [
        "All the exams, ai and valuation available for you",
      ],
      variant: "glow",
    },
  ],
  className = "",
}: PricingProps) {
  return (
    <section className={cn(className)}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12">
        {(title || description) && (
          <div className="flex flex-col items-center gap-4 px-4 text-center sm:gap-8">
            {title && (
              <h2 className="text-3xl leading-tight font-semibold sm:text-5xl sm:leading-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-md text-muted-foreground max-w-[600px] font-medium sm:text-xl">
                {description}
              </p>
            )}
          </div>
        )}
        {plans !== false && plans.length > 0 && (
          <div className="max-w-container mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PricingColumn
                key={plan.name}
                name={plan.name}
                icon={plan.icon}
                description={plan.description}
                price={plan.price}
                originalPrice={plan.originalPrice}
                promotionText={plan.promotionText}
                priceNote={plan.priceNote}
                cta={plan.cta}
                features={plan.features}
                variant={plan.variant}
                className={plan.className}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
