import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Lock, User, UserPlus, Sparkles, ArrowLeft } from "lucide-react";
import api from "../api/axios";
import styles from "../styles.jsx";

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
    <div style={styles.auth.authPage}>
      {/* Split-screen container */}
      <div style={styles.auth.authCard}>
        {/* Left Side - Pantheon Branding & Gateway Welcome */}
        <div style={styles.auth.authBrandSide}>
          <div style={styles.auth.authBrandContent}>
            <div style={styles.auth.authLogoRow}>
              <Film size={36} color="#f4c96b" />
              <span style={styles.auth.authLogoText}>PANTHEON</span>
            </div>
            <h1 style={styles.auth.authBrandTitle}>Join the Pantheon</h1>
            <p style={styles.auth.authBrandSubtitle}>
              Create your profile to curate your personal movie database, review films, and maintain your watchlist.
            </p>
          </div>
          <div style={styles.auth.authBrandFooter}>
            <Sparkles size={16} color="#f4c96b" />
            <span>Instant access upon registration</span>
          </div>
        </div>

        {/* Right Side - Registration Form & Actions */}
        <div style={styles.auth.authFormSide}>
          <div style={styles.auth.authFormHeader}>
            <h2 style={styles.auth.authFormTitle}>Create Account</h2>
            <p style={styles.auth.authFormSubtitle}>Sign up for a free Pantheon account</p>
          </div>

          {error && <div style={styles.auth.authErrorBanner}>{error}</div>}

          <form onSubmit={handleRegister} style={styles.auth.authForm}>
            <div style={styles.auth.authInputGroup}>
              <User size={18} color="#85818d" style={styles.auth.authInputIcon} />
              <input
                type="text"
                placeholder="Choose Username"
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
                placeholder="Choose Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.auth.authInput}
                required
              />
            </div>

            <button type="submit" style={styles.auth.authPrimaryButton} disabled={loading}>
              <UserPlus size={18} />
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* Navigation link to Login */}
          <div style={styles.auth.newAccountActionRow}>
            <button
              type="button"
              style={styles.auth.secondaryBtn}
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
