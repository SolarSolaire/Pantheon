import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Lock, User, UserPlus, Sparkles, ArrowLeft } from "lucide-react";
import api from "../api/axios";
import { newAccountStyles as styles } from "../sharedStyles.jsx";

export default function NewAccount() {
  // variable declaration
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // sends registration payload to backend
      const res = await api.post("/auth/register", {
        username,
        password,
      });

      // automatically logs the user in by saving the JWT token
      localStorage.setItem("pantheon_token", res.data.token);

      // navigates straight to the home page
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Split-screen container */}
      <div style={styles.card}>
        {/* Left Side - Pantheon Branding & Gateway Welcome */}
        <div style={styles.brandSide}>
          <div style={styles.brandContent}>
            <div style={styles.logoRow}>
              <Film size={36} color="#f4c96b" />
              <span style={styles.logoText}>PANTHEON</span>
            </div>
            <h1 style={styles.brandTitle}>Join the Pantheon</h1>
            <p style={styles.brandSubtitle}>
              Create your profile to curate your personal movie database, review films, and maintain your watchlist.
            </p>
          </div>
          <div style={styles.brandFooter}>
            <Sparkles size={16} color="#f4c96b" />
            <span>Instant access upon registration</span>
          </div>
        </div>

        {/* Right Side - Registration Form & Actions */}
        <div style={styles.formSide}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create Account</h2>
            <p style={styles.formSubtitle}>Sign up for a free Pantheon account</p>
          </div>

          {error && <div style={styles.errorBanner}>{error}</div>}

          <form onSubmit={handleRegister} style={styles.form}>
            <div style={styles.inputGroup}>
              <User size={18} color="#85818d" style={styles.inputIcon} />
              <input
                type="text"
                placeholder="Choose Username"
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
                placeholder="Choose Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <button type="submit" style={styles.primaryBtn} disabled={loading}>
              <UserPlus size={18} />
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* Navigation link to Login */}
          <div style={styles.actionRow}>
            <button
              type="button"
              style={styles.secondaryBtn}
              onClick={() => navigate("/login")}
            >
              <ArrowLeft size={16} />
              Already have an account? Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dark Cinematic Theme Styling matching Login.jsx
