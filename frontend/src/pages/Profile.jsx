import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Eye, MessageSquareText, Save } from "lucide-react";
import {
  fetchUserProfile,
  fetchUserStatistics,
  logoutUser,
  updateUserProfile
} from "../api/userData";
import Navbar from "../components/Navbar";

const styles = {
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px clamp(20px, 5vw, 72px)",
    color: "#f5f3ef"
  },
  title: {
    margin: "0 0 24px",
    fontSize: "1.8rem",
    fontWeight: 800
  },
  panel: {
    padding: "22px",
    border: "1px solid #2b2931",
    borderRadius: "12px",
    backgroundColor: "#19181e"
  },
  form: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "end",
    gap: "12px"
  },
  field: {
    display: "grid",
    flex: "1 1 260px",
    gap: "8px",
    color: "#aaa7b2",
    fontSize: "0.9rem"
  },
  input: {
    boxSizing: "border-box",
    width: "100%",
    padding: "11px 12px",
    border: "1px solid #44414b",
    borderRadius: "8px",
    backgroundColor: "#111015",
    color: "#f5f3ef",
    font: "inherit"
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "11px 16px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#f4c96b",
    color: "#17140d",
    font: "inherit",
    fontWeight: 800,
    cursor: "pointer"
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "14px",
    marginTop: "22px"
  },
  stat: {
    display: "grid",
    gap: "8px",
    padding: "18px",
    border: "1px solid #2b2931",
    borderRadius: "10px",
    backgroundColor: "#19181e"
  },
  statLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#aaa7b2",
    fontSize: "0.88rem"
  },
  statValue: {
    color: "#f4c96b",
    fontSize: "1.45rem",
    fontWeight: 800
  },
  message: {
    marginTop: "14px",
    color: "#aaa7b2",
    fontSize: "0.9rem"
  },
  error: {
    color: "#ffb4b4"
  }
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetchUserProfile(controller.signal),
      fetchUserStatistics(controller.signal)
    ])
      .then(([profile, profileStatistics]) => {
        setUser(profile);
        setUsername(profile.username);
        setStatistics(profileStatistics);
      })
      .catch((loadError) => {
        if (!controller.signal.aborted) {
          setError(loadError.message || "Could not load your profile.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const updatedUser = await updateUserProfile(username);
      setUser(updatedUser);
      setUsername(updatedUser.username);
      setMessage("Profile updated.");
    } catch (saveError) {
      setError(saveError.response?.data?.message || saveError.message || "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
      navigate("/login", { replace: true });
    } catch (logoutError) {
      setError(logoutError.message || "Could not revoke your session.");
    }
  }

  return (
    <div>
      <Navbar
        actions={[
          { label: "Home", onClick: () => navigate("/home") },
          { label: "Watchlist", onClick: () => navigate("/watchlist") },
          { label: "Reviews", onClick: () => navigate("/reviews") },
          { label: "Logout", onClick: handleLogout }
        ]}
      />
      <main style={styles.container}>
        <h1 style={styles.title}>My Profile</h1>
        {loading && <p style={styles.message}>Loading profile...</p>}
        {error && <p style={{ ...styles.message, ...styles.error }}>{error}</p>}
        {!loading && user && (
          <>
            <section style={styles.panel}>
              <form style={styles.form} onSubmit={handleSubmit}>
                <label style={styles.field}>
                  Username
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    maxLength={40}
                    required
                    style={styles.input}
                  />
                </label>
                <button type="submit" disabled={saving} style={styles.button}>
                  <Save size={16} />
                  {saving ? "Saving..." : "Save profile"}
                </button>
              </form>
              <p style={styles.message}>
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
              {message && <p style={styles.message}>{message}</p>}
            </section>

            {statistics && (
              <section style={styles.stats} aria-label="Your statistics">
                <div style={styles.stat}>
                  <span style={styles.statLabel}>
                    <Eye size={16} /> Movies watched
                  </span>
                  <strong style={styles.statValue}>{statistics.moviesWatched}</strong>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statLabel}>
                    <Star size={16} /> Average rating
                  </span>
                  <strong style={styles.statValue}>
                    {statistics.averageRating == null
                      ? "—"
                      : `${Number(statistics.averageRating).toFixed(1)}/10`}
                  </strong>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statLabel}>
                    <Star size={16} /> Titles rated
                  </span>
                  <strong style={styles.statValue}>{statistics.ratings.count}</strong>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statLabel}>
                    <MessageSquareText size={16} /> Reviews
                  </span>
                  <strong style={styles.statValue}>{statistics.reviews}</strong>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
