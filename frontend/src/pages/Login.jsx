import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import api from "../api/axios";
import { loginStyles as styles } from "../sharedStyles.jsx";

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
