import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { registerSW } from "virtual:pwa-register";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker with VitePWA
if ("serviceWorker" in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      console.log("[PWA] New content available, refresh needed");
    },
    onOfflineReady() {
      console.log("[PWA] App ready to work offline");
    },
    onRegistered(registration) {
      console.log("[PWA] Service Worker registered:", registration);
    },
    onRegisterError(error) {
      console.error("[PWA] Service Worker registration error:", error);
    },
  });

  // Also trigger the beforeinstallprompt event if available
  window.addEventListener("beforeinstallprompt", (e) => {
    console.log("[PWA] beforeinstallprompt event in main.jsx");
    // Dispatch custom event for InstallPWA component
    window.dispatchEvent(
      new CustomEvent("pwa-installable", { detail: e })
    );
  });
}
