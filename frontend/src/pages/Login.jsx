import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import api from "../api/axios";
import styles from "../styles.jsx";

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
    <div style={styles.auth.authPage}>
      {/* Split-screen container */}
      <div style={styles.auth.authCard}>
        {/* Left Side - Pantheon Branding & Cinematic Backdrop */}
        <div style={styles.auth.authBrandSide}>
          <div style={styles.auth.authBrandContent}>
            <div style={styles.auth.authLogoRow}>
              <Film size={36} color="#f4c96b" />
              <span style={styles.auth.authLogoText}>PANTHEON</span>
            </div>
            <h1 style={styles.auth.authBrandTitle}>Movie Tracker</h1>
            <p style={styles.auth.authBrandSubtitle}>
              Enter the gateway to log, rate, and discover your personal collection of cinema.
            </p>
          </div>
          <div style={styles.auth.authBrandFooter}>
            <Sparkles size={16} color="#f4c96b" />
            <span>Frontend active on port 5173</span>
          </div>
        </div>

        {/* Right Side - Form, Status & Navigation */}
        <div style={styles.auth.authFormSide}>
          <div style={styles.auth.authFormHeader}>
            <h2 style={styles.auth.authFormTitle}>Welcome Back</h2>
            <p style={styles.auth.authFormSubtitle}>Sign in to your account to continue</p>
          </div>

          {error && <div style={styles.auth.authErrorBanner}>{error}</div>}

          <form onSubmit={handleLogin} style={styles.auth.authForm}>
            <div style={styles.auth.authInputGroup}>
              <User size={18} color="#85818d" style={styles.auth.authInputIcon} />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.auth.authInput}
                required
              />
            </div>

            <div style={styles.auth.authInputGroup}>
              <Lock size={18} color="#85818d" style={styles.auth.authInputIcon} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.auth.authInput}
                required
              />
            </div>

            <button type="submit" style={styles.auth.authPrimaryButton}>
              Log In <ArrowRight size={18} />
            </button>
          </form>

          {/* Backend Health Status Box */}
          <div style={styles.auth.loginStatusBox}>
            <span style={styles.auth.loginStatusTitle}>Backend Status (Port 5001):</span>
            <p style={styles.auth.loginStatusMessage}>{backendStatus}</p>
          </div>

          {/* Secondary Actions */}
          <div style={styles.auth.loginActionRow}>
            <button
              type="button"
              style={styles.auth.newAccountButton}
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
