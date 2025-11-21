import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!phone || !password) {
      setError("Please enter both phone and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await authService.login(phone, password);

      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message || "Login failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  };

  return (
    <div
      className="safe-area-top safe-area-bottom"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: window.innerWidth <= 480 ? "12px" : "16px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          padding: window.innerWidth <= 480 ? "24px" : "40px",
          width: "100%",
          maxWidth: "400px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            textAlign: "center",
            marginBottom: window.innerWidth <= 480 ? "24px" : "32px",
          }}
        >
          <div
            style={{
              width: window.innerWidth <= 480 ? "64px" : "80px",
              height: window.innerWidth <= 480 ? "64px" : "80px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: window.innerWidth <= 480 ? "24px" : "32px",
              color: "white",
            }}
          >
            🛡️
          </div>
          <h1
            style={{
              margin: "0 0 8px 0",
              fontSize: window.innerWidth <= 480 ? "24px" : "28px",
              fontWeight: "700",
              color: "#1a202c",
              letterSpacing: "-0.5px",
            }}
          >
            Warden Portal
          </h1>
          <p
            style={{
              margin: "0",
              color: "#718096",
              fontSize: window.innerWidth <= 480 ? "14px" : "16px",
            }}
          >
            Food Hygiene Inspection System
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: "#fed7d7",
              color: "#c53030",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontSize: "14px",
              border: "1px solid #feb2b2",
            }}
          >
            <strong>⚠️ {error}</strong>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ width: "100%" }}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "16px",
                transition: "all 0.2s ease",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#667eea";
                e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "16px",
                transition: "all 0.2s ease",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#667eea";
                e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !phone || !password}
            style={{
              width: "100%",
              padding: "14px 24px",
              background:
                loading || !phone || !password
                  ? "#cbd5e0"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor:
                loading || !phone || !password ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              transform: loading ? "none" : "translateY(0)",
              boxShadow:
                loading || !phone || !password
                  ? "none"
                  : "0 4px 12px rgba(102, 126, 234, 0.4)",
            }}
            onMouseEnter={(e) => {
              if (!loading && phone && password) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow =
                  "0 6px 20px rgba(102, 126, 234, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && phone && password) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow =
                  "0 4px 12px rgba(102, 126, 234, 0.4)";
              }
            }}
          >
            {loading ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    width: "20px",
                    height: "20px",
                    border: "2px solid #ffffff40",
                    borderTop: "2px solid #ffffff",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginRight: "8px",
                  }}
                ></span>
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "32px",
            paddingTop: "24px",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <p
            style={{
              margin: "0",
              fontSize: "14px",
              color: "#718096",
            }}
          >
            Secure access for authorized wardens only
          </p>
        </div>

        {/* CSS Animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
