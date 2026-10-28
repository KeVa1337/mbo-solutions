import { useState } from "react";
import { Header, Hero } from "./sections/Top";
import { Process, Stats, Work } from "./sections/Middle";
import { Contact, Faq, Footer, MobileBar, Pricing, Proof } from "./sections/Bottom";
import type { ProjectType } from "./data";

export default function App() {
  // buttons across the page preselect the project type in the contact form
  const [type, setType] = useState<ProjectType>("Лендінг");
  const pick = (t: ProjectType) => {
    setType(t);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };
  const concept = () => pick("Безкоштовний концепт");

  return (
    <>
      <Header />
      <main>
        <Hero onConcept={concept} />
        <Stats />
        <Work />
        <Process />
        <Pricing onPick={pick} />
        <Proof onConcept={concept} />
        <Faq />
        <Contact type={type} setType={setType} />
      </main>
      <Footer />
      <MobileBar />
    </>
  );
}
