"use client";

import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

const testimonials = [
  { quote: "Reviewing code tests used to take days. Now it takes minutes.", name: "Acme Corp", title: "Engineering Team" },
  { quote: "The bias-free reporting helped us diversify our hiring.", name: "Global Bank", title: "HR Department" },
  { quote: "Best proctoring solution we have used for remote exams.", name: "TechFlow", title: "University Board" },
  { quote: "Seamless integration with our existing LMS.", name: "UniSpace", title: "IT Admin" },
];

export function TrustedByScroll() {
  return (
    <div className="h-[20rem] rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden mt-24">
      <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
        Trusted by 500+ University & Engineering Teams
      </h3>
      <InfiniteMovingCards
        items={testimonials}
        direction="right"
        speed="slow"
      />
    </div>
  );
}