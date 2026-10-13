import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Lock, User, UserPlus, Sparkles, ArrowLeft } from "lucide-react";
import api from "../api/axios";

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
  card: {
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
  actionRow: {
    display: "flex",
    marginTop: "24px"
  },
  secondaryBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    backgroundColor: "#242229",
    border: "1px solid #44414b",
    borderRadius: "9px",
    color: "#f0edf4",
    fontSize: "0.88rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "transform 0.15s ease"
  }
};