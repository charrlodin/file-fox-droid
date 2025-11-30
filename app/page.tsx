"use client";

import {
  Navigation,
  Hero,
  Features,
  HowItWorks,
  UploadSection,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen noise-bg gradient-mesh">
      <Navigation />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <UploadSection />
      </main>
      <Footer />
    </div>
  );
}
