import { WebGLBackground } from "./components/WebGLBackground";
import { Preloader } from "./components/Preloader";
import { SystemHUD } from "./components/SystemHUD";
import { SystemSpine } from "./components/SystemSpine";
import { CursorField } from "./components/CursorField";
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
      <WebGLBackground />
      <div className="app-shell">
        <CursorField />
        <Preloader />
        <SystemHUD />
        <SystemSpine />
        <Navbar />
        <main>
          <Hero />
          <GrowthPipeline />
          <AIAgents />
          <SystemModules />
          <JourneyFlow />
          <Architect />
          <FinalCTA />
        </main>
        <Footer />
        <CTAOverlay />
      </div>
    </>
  );
}
