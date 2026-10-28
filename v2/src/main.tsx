import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import App from "./App";
import { initTracking } from "./track";
import "./index.css";

initTracking();

// the page is pre-rendered at build time; React takes over the existing markup
hydrateRoot(
  document.getElementById("root")!,
  <StrictMode>
    {/* reducedMotion="user" turns transform animations off for people who asked their OS for less motion */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
);
