import { useEffect, useMemo, useState } from "react";

const getPlatform = () => {
  if (typeof window === "undefined") return "desktop";
  const ua = window.navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
};

const isStandalone = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
};

function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showFallback, setShowFallback] = useState(getPlatform() === "ios");
  const [platform, setPlatform] = useState(getPlatform());
  const [dismissed, setDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const standalone = useMemo(isStandalone, []);

  useEffect(() => {
    setPlatform(getPlatform());
    setShowFallback(getPlatform() === "ios");
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (standalone) return;

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setShowFallback(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [standalone]);

  useEffect(() => {
    if (standalone) return;

    if (platform === "ios") {
      setShowFallback(true);
      return;
    }

    setShowFallback(false);

    if (platform === "android" && !deferredPrompt) {
      const timer = window.setTimeout(() => setShowFallback(true), 4000);
      return () => window.clearTimeout(timer);
    }
  }, [platform, deferredPrompt, standalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowFallback(false);
    setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setDeferredPrompt(null);
    setShowFallback(false);
  };

  if (standalone || dismissed || (!deferredPrompt && !showFallback)) return null;

  const title =
    platform === "ios" ? "Install Food Portal App" : "Install the Food Portal App";
  const description =
    platform === "ios"
      ? "Add this app to your home screen for faster access, offline support, and a native feel."
      : "Install our app for offline access, instant launching, and smoother performance.";

  const primaryActionLabel = platform === "ios" || showFallback ? "Got it" : "Install App";

  const cardStyle = {
    position: "fixed",
    bottom: isMobile ? "0.75rem" : "1.5rem",
    right: isMobile ? "auto" : "1.5rem",
    left: isMobile ? "50%" : "auto",
    transform: isMobile ? "translateX(-50%)" : "none",
    width: isMobile ? "min(380px, calc(100vw - 1.5rem))" : "360px",
    background: "linear-gradient(135deg, #5b6cfb, #7d5bfb)",
    color: "#fff",
    borderRadius: "18px",
    boxShadow: "0 18px 40px rgba(32, 38, 135, 0.35)",
    padding: "1.5rem",
    zIndex: 1000,
    fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  };

  const buttonStyle = {
    width: "100%",
    border: "none",
    borderRadius: "12px",
    padding: "0.85rem",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
  };

  const renderInstructions = () => {
    if (platform === "ios") {
      return "Tap the share icon, then choose “Add to Home Screen” to pin the app.";
    }
    return "Open your browser menu and pick “Install app” or “Add to Home screen”.";
  };

  return (
    <div style={cardStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}
      >
        <div>
          <strong style={{ fontSize: "1rem" }}>{title}</strong>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#e7e8ff" }}>
            {description}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          style={{
            background: "transparent",
            border: "none",
            color: "#d6d8ff",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>

      {(platform === "ios" || showFallback) && (
        <p style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: "#f4f5ff" }}>
          {renderInstructions()}
        </p>
      )}

      <div style={{ display: "flex", gap: "0.75rem", flexDirection: "column" }}>
        <button
          style={{
            ...buttonStyle,
            backgroundColor: "#fff",
            color: "#4a42b2",
          }}
          onClick={platform === "ios" || showFallback ? handleDismiss : handleInstallClick}
        >
          {primaryActionLabel}
        </button>

        {!showFallback && (
          <button
            style={{
              ...buttonStyle,
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              color: "#f8f8ff",
            }}
            onClick={handleDismiss}
          >
            Later
          </button>
        )}
      </div>
    </div>
  );
}

export default InstallPWA;

