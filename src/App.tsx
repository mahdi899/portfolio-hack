import { Background } from "./components/Background";
import { Preloader } from "./components/Preloader";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero/Hero";
import { GrowthPipeline } from "./components/GrowthPipeline";
import { AIAgents } from "./components/AIAgents";
import { SystemModules } from "./components/SystemModules";
import { Architect } from "./components/Architect";
import { JourneyFlow } from "./components/JourneyFlow";
import { FinalCTA } from "./components/FinalCTA";
import { Footer } from "./components/Footer";
import { CTAOverlay } from "./components/CTAOverlay";

export default function App() {
  return (
    <>
      <Background />
      <Preloader />
      <Navbar />
      <main>
        <Hero />
        <GrowthPipeline />
        <AIAgents />
        <SystemModules />
        <Architect />
        <JourneyFlow />
        <FinalCTA />
      </main>
      <Footer />
      <CTAOverlay />
    </>
  );
}
