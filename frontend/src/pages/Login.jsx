import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import api from "../api/axios";

export default function Login() {
  const [backendStatus, setBackendStatus] = useState("Connecting to backend...");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // pings backend server running on port 5001
    api
      .get("/health")
      .then((res) => setBackendStatus(res.data.message))
      .catch((err) =>
        setBackendStatus(`Backend offline or CORS issue: ${err.message}`)
      );
  }, []);

  // attempts to login, navigating to the home page if successful
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("pantheon_token", res.data.token);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed.");
    }
  };

  // navigates to the new account page
  const handleNewAccount = () => {
    navigate("/newaccount");
  };

  return (
    <div style={styles.page}>
      {/* Global CSS reset for edge-to-edge dark background */}
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100vh;
          background-color: #101014;
        }
        * {
          box-sizing: border-box;
        }
        input::placeholder {
          color: #85818d;
        }
      `}</style>

      {/* Split-screen container */}
      <div style={styles.loginCard}>
        {/* Left Side - Pantheon Branding & Cinematic Backdrop */}
        <div style={styles.brandSide}>
          <div style={styles.brandContent}>
            <div style={styles.logoRow}>
              <Film size={36} color="#f4c96b" />
              <span style={styles.logoText}>PANTHEON</span>
            </div>
            <h1 style={styles.brandTitle}>Movie Tracker</h1>
            <p style={styles.brandSubtitle}>
              Enter the gateway to log, rate, and discover your personal collection of cinema.
            </p>
          </div>
          <div style={styles.brandFooter}>
            <Sparkles size={16} color="#f4c96b" />
            <span>Frontend active on port 5173</span>
          </div>
        </div>

        {/* Right Side - Form, Status & Navigation */}
        <div style={styles.formSide}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Welcome Back</h2>
            <p style={styles.formSubtitle}>Sign in to your account to continue</p>
          </div>

          {error && <div style={styles.errorBanner}>{error}</div>}

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <User size={18} color="#85818d" style={styles.inputIcon} />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <Lock size={18} color="#85818d" style={styles.inputIcon} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <button type="submit" style={styles.primaryBtn}>
              Log In <ArrowRight size={18} />
            </button>
          </form>

          {/* Backend Health Status Box */}
          <div style={styles.statusBox}>
            <span style={styles.statusTitle}>Backend Status (Port 5001):</span>
            <p style={styles.statusMessage}>{backendStatus}</p>
          </div>

          {/* Secondary Actions */}
          <div style={styles.actionRow}>
            <button
              type="button"
              style={styles.newAccountBtn}
              onClick={handleNewAccount}
            >
              New to Pantheon?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dark Cinematic Theme Styling
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#101014",
    color: "#f5f3ef",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  loginCard: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    width: "100%",
    maxWidth: "960px",
    minHeight: "560px",
    backgroundColor: "#19181e",
    borderRadius: "16px",
    border: "1px solid #2b2931",
    overflow: "hidden",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)"
  },
  /* Left Branding Side */
  brandSide: {
    position: "relative",
    background:
      "linear-gradient(135deg, rgba(244, 201, 107, 0.12) 0%, rgba(16, 16, 20, 0.95) 100%), #151419",
    borderRight: "1px solid #2b2931",
    padding: "48px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  brandContent: {
    marginTop: "20px"
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px"
  },
  logoText: {
    color: "#f4c96b",
    fontSize: "1.6rem",
    fontWeight: "800",
    letterSpacing: "0.1em"
  },
  brandTitle: {
    fontSize: "2.4rem",
    fontWeight: "800",
    margin: "0 0 16px 0",
    color: "#f5f3ef",
    letterSpacing: "-0.03em",
    lineHeight: "1.1"
  },
  brandSubtitle: {
    color: "#aaa7b2",
    fontSize: "1rem",
    lineHeight: "1.6",
    margin: 0,
    maxWidth: "340px"
  },
  brandFooter: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.82rem",
    color: "#85818d",
    borderTop: "1px solid #29282e",
    paddingTop: "16px"
  },
  /* Right Form Side */
  formSide: {
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#19181e"
  },
  formHeader: {
    marginBottom: "28px"
  },
  formTitle: {
    fontSize: "1.75rem",
    fontWeight: "800",
    margin: "0 0 6px 0",
    color: "#f5f3ef"
  },
  formSubtitle: {
    fontSize: "0.9rem",
    color: "#aaa7b2",
    margin: 0
  },
  errorBanner: {
    backgroundColor: "#2e1a1c",
    border: "1px solid #6a3338",
    color: "#ffb4b4",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "0.85rem",
    marginBottom: "20px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  inputGroup: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    pointerEvents: "none"
  },
  input: {
    width: "100%",
    padding: "13px 14px 13px 44px",
    backgroundColor: "#101014",
    border: "1px solid #393740",
    borderRadius: "10px",
    color: "#f5f3ef",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.15s ease"
  },
  primaryBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "13px",
    backgroundColor: "#f4c96b",
    color: "#17140d",
    border: "none",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "800",
    cursor: "pointer",
    transition: "transform 0.15s ease, background-color 0.15s ease",
    marginTop: "8px"
  },
  statusBox: {
    marginTop: "24px",
    padding: "14px",
    borderRadius: "10px",
    backgroundColor: "#101014",
    border: "1px solid #29282e"
  },
  statusTitle: {
    fontSize: "0.78rem",
    color: "#85818d",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: "700"
  },
  statusMessage: {
    margin: "4px 0 0 0",
    fontSize: "0.88rem",
    fontWeight: "600",
    color: "#f4c96b"
  },
  actionRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "20px"
  },
  newAccountBtn: {
    padding: "10px",
    backgroundColor: "#242229",
    border: "1px solid #44414b",
    borderRadius: "9px",
    color: "#f0edf4",
    fontSize: "0.85rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "transform 0.15s ease"
  }
};