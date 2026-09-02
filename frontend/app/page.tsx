import FooterSection from "@/components/Landing/Footer/Footer";
import { LandingNavbar } from "@/components/Landing/Navbar/Navbar";
import Pricing from "@/components/Landing/Pricing/Pricing";
import { Product } from "@/components/Landing/Product/Product";
import { FeaturesSection } from "@/components/Landing/Solution/Solution";
import React from "react";

const page = () => {
  return (
    <div>
      <LandingNavbar />
      <Product />
      <FeaturesSection />
      <Pricing />
      <FooterSection />
    </div>
  );
};

export default page;
