import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Eye,
  MessageSquareText,
  Clock,
  ListVideo,
  User,
  Lock,
  Trash2,
} from "lucide-react";
import { isAuthenticated } from "../utils/auth";
import {
  fetchUserProfile,
  fetchUserStatistics,
  logoutUser,
  updateUserProfile,
  updateUserPassword,
} from "../api/userData";
import useUserWatchlist from "../hooks/useUserWatchlist";
import Navbar from "../components/Navbar";

const styles = {
  // ... (Keep all your existing styles exactly as they were)
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px clamp(20px, 5vw, 72px)",
    color: "#f5f3ef",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "20px",
    margin: "0 0 32px",
  },
  titleInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  title: {
    margin: 0,
    fontSize: "2rem",
    fontWeight: 800,
  },
  subtitle: {
    margin: 0,
    color: "#aaa7b2",
    fontSize: "0.95rem",
  },
  tabsContainer: {
    display: "flex",
    gap: "12px",
    marginBottom: "32px",
    borderBottom: "1px solid #2b2931",
  },
  tabButton: {
    padding: "12px 20px",
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "#aaa7b2",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  activeTabButton: {
    color: "#f4c96b",
    borderBottom: "2px solid #f4c96b",
  },
  panel: {
    padding: "32px",
    border: "1px solid #2b2931",
    borderRadius: "12px",
    backgroundColor: "#19181e",
    marginBottom: "24px",
  },
  panelHeader: {
    marginBottom: "24px",
  },
  panelTitle: {
    margin: "0 0 8px",
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#f5f3ef",
  },
  panelDescription: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#aaa7b2",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  fieldRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 260px",
    gap: "8px",
    color: "#e1dee6",
    fontSize: "0.95rem",
    fontWeight: 600,
  },
  input: {
    boxSizing: "border-box",
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #44414b",
    borderRadius: "8px",
    backgroundColor: "#111015",
    color: "#f5f3ef",
    font: "inherit",
    transition: "border-color 0.2s ease",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#f4c96b",
    color: "#17140d",
    font: "inherit",
    fontWeight: 800,
    cursor: "pointer",
    alignSelf: "flex-start",
    transition: "opacity 0.2s ease",
  },
  dangerZone: {
    padding: "32px",
    border: "1px solid #6a3338",
    borderRadius: "12px",
    backgroundColor: "#2e1a1c",
    marginTop: "40px",
  },
  dangerTitle: {
    margin: "0 0 8px",
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#ffb4b4",
  },
  dangerButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#ff4d4d",
    color: "#fff",
    font: "inherit",
    fontWeight: 800,
    cursor: "pointer",
    marginTop: "20px",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "24px",
    border: "1px solid #2b2931",
    borderRadius: "10px",
    backgroundColor: "#19181e",
    transition: "transform 0.2s ease, border-color 0.2s ease",
  },
  statHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#aaa7b2",
  },
  statLabel: {
    fontSize: "0.95rem",
    fontWeight: 600,
  },
  statValue: {
    color: "#f4c96b",
    fontSize: "2rem",
    fontWeight: 800,
    lineHeight: 1,
  },
  watchedStatButton: {
    width: "100%",
    padding: 0,
    border: 0,
    background: "transparent",
    color: "inherit",
    font: "inherit",
    textAlign: "left",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  message: {
    margin: "0 0 16px",
    padding: "12px 16px",
    borderRadius: "8px",
    backgroundColor: "rgba(244, 201, 107, 0.1)",
    color: "#f4c96b",
    fontSize: "0.95rem",
    fontWeight: 600,
  },
  error: {
    backgroundColor: "rgba(255, 77, 77, 0.1)",
    color: "#ffb4b4",
    border: "1px solid #6a3338",
  },
};

// 1. Consolidated to a single, robust formatting function outside the component
const formatWatchTime = (totalMinutes) => {
  if (totalMinutes == null || isNaN(totalMinutes) || totalMinutes === 0)
    return "0h 0m";

  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
};

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const { userTitles } = useUserWatchlist();
  const watchlistCount = userTitles
    ? userTitles.filter((title) => title.in_watchlist).length
    : 0;

  const [currentUser, setCurrentUser] = useState(null);
  const [user, setUser] = useState(null);
  const [statistics, setStatistics] = useState(null);

  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const redirectIfSignedOut = () => {
      if (!isAuthenticated()) {
        navigate("/login", { replace: true });
        return false;
      }
      return true;
    };

    const loadUser = async () => {
      if (redirectIfSignedOut()) {
        try {
          const profile = await fetchUserProfile();
          setCurrentUser(profile);
        } catch (error) {
          console.error("Failed to load user profile:", error);
        }
      }
    };

    loadUser();

    window.addEventListener("storage", redirectIfSignedOut);
    window.addEventListener("focus", redirectIfSignedOut);
    return () => {
      window.removeEventListener("storage", redirectIfSignedOut);
      window.removeEventListener("focus", redirectIfSignedOut);
    };
  }, [navigate]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetchUserProfile(controller.signal),
      fetchUserStatistics(controller.signal),
    ])
      .then(([profile, profileStatistics]) => {
        setUser(profile);
        setUsername(profile.username || "");
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

  // 2. Inner duplicate formatting function removed

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setSavingProfile(true);
    setError("");
    setMessage("");
    try {
      const updatedUser = await updateUserProfile(username);
      setUser(updatedUser);
      setUsername(updatedUser.username);
      setCurrentUser(updatedUser);
      setMessage("Profile information updated successfully.");
    } catch (saveError) {
      setError(
        saveError.response?.data?.message ||
          saveError.message ||
          "Could not update your profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setSavingPassword(true);
    setError("");
    setMessage("");

    try {
      await updateUserPassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password updated successfully.");
    } catch (saveError) {
      setError(
        saveError.response?.data?.message ||
          saveError.message ||
          "Could not update your password.",
      );
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    if (
      window.confirm(
        "Are you absolutely sure you want to delete your account? This action cannot be undone and all your reviews and ratings will be permanently lost.",
      )
    ) {
      console.log("Account deletion requested");
      // TODO: Connect this to a deleteUserAccount() API route when you're ready
    }
  }

  async function handleAuthAction() {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Could not revoke user session:", error);
    }
    navigate("/login", { replace: true });
  }

  return (
    <div>
      <Navbar
        userName={currentUser?.name || currentUser?.username}
        actions={[
          { label: "Home", onClick: () => navigate("/home") },
          { label: "Watchlist", onClick: () => navigate("/watchlist") },
          { label: "Reviews", onClick: () => navigate("/reviews") },
          { label: "Account", onClick: () => navigate("/profile") },
          { label: "Logout", onClick: handleAuthAction },
        ]}
      />

      <main style={styles.container}>
        {loading && <p style={styles.subtitle}>Loading profile...</p>}

        {!loading && user && (
          <>
            <header style={styles.header}>
              <div style={styles.titleInfo}>
                <h1 style={styles.title}>{user.username}</h1>
                <p style={styles.subtitle}>
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </header>

            <div style={styles.tabsContainer} role="tablist">
              <button
                role="tab"
                aria-selected={activeTab === "overview"}
                style={{
                  ...styles.tabButton,
                  ...(activeTab === "overview" ? styles.activeTabButton : {}),
                }}
                onClick={() => {
                  setActiveTab("overview");
                  setMessage("");
                  setError("");
                }}
              >
                Overview
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "account"}
                style={{
                  ...styles.tabButton,
                  ...(activeTab === "account" ? styles.activeTabButton : {}),
                }}
                onClick={() => {
                  setActiveTab("account");
                  setMessage("");
                  setError("");
                }}
              >
                Account Settings
              </button>
            </div>

            {error && (
              <div style={{ ...styles.message, ...styles.error }}>{error}</div>
            )}
            {message && <div style={styles.message}>{message}</div>}

            {/* --- OVERVIEW TAB --- */}
            {activeTab === "overview" && statistics && (
              <section style={styles.stats} aria-label="Your statistics">
                <div style={styles.stat}>
                  <button
                    type="button"
                    style={styles.watchedStatButton}
                    onClick={() => navigate("/watched")}
                    aria-label={`View ${statistics.moviesWatched} watched movies`}
                  >
                    <div style={styles.statHeader}>
                      <span style={styles.statLabel}>Movies Watched</span>
                      <Eye size={20} color="#60a5fa" />
                    </div>
                    <strong style={styles.statValue}>
                      {statistics.moviesWatched}
                    </strong>
                  </button>
                </div>

                <div style={styles.stat}>
                  <div style={styles.statHeader}>
                    <span style={styles.statLabel}>Titles Rated</span>
                    <Star size={20} color="#f4c96b" />
                  </div>
                  <strong style={styles.statValue}>
                    {statistics.ratings?.count || 0}
                  </strong>
                </div>

                <div style={styles.stat}>
                  <div style={styles.statHeader}>
                    <span style={styles.statLabel}>Average Rating</span>
                    <Star size={20} color="#f4c96b" />
                  </div>
                  <strong style={styles.statValue}>
                    {statistics.averageRating == null
                      ? "—"
                      : `${Number(statistics.averageRating).toFixed(1)}`}
                  </strong>
                </div>

                <div style={styles.stat}>
                  <div style={styles.statHeader}>
                    <span style={styles.statLabel}>Reviews Written</span>
                    <MessageSquareText size={20} color="#10b981" />
                  </div>
                  <strong style={styles.statValue}>
                    {statistics.reviews || 0}
                  </strong>
                </div>

                <div style={styles.stat}>
                  <div style={styles.statHeader}>
                    <span style={styles.statLabel}>Watchlist Size</span>
                    <ListVideo size={20} color="#a78bfa" />
                  </div>
                  <strong style={styles.statValue}>{watchlistCount}</strong>
                </div>

                <div style={styles.stat}>
                  <div style={styles.statHeader}>
                    <span style={styles.statLabel}>Total Watch Time</span>
                    <Clock size={20} color="#fb923c" />
                  </div>
                  <strong style={styles.statValue}>
                    {formatWatchTime(statistics.totalWatchTimeMinutes)}
                  </strong>
                </div>
              </section>
            )}

            {/* --- ACCOUNT SETTINGS TAB --- */}
            {activeTab === "account" && (
              <div>
                <section style={styles.panel}>
                  <div style={styles.panelHeader}>
                    <h2 style={styles.panelTitle}>Profile Information</h2>
                    <p style={styles.panelDescription}>
                      Update your public username.
                    </p>
                  </div>
                  <form style={styles.form} onSubmit={handleProfileSubmit}>
                    <div style={styles.fieldRow}>
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
                    </div>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      style={styles.button}
                    >
                      <User size={18} />
                      {savingProfile ? "Saving..." : "Save Profile"}
                    </button>
                  </form>
                </section>

                <section style={styles.panel}>
                  <div style={styles.panelHeader}>
                    <h2 style={styles.panelTitle}>Change Password</h2>
                    <p style={styles.panelDescription}>
                      Ensure your account is using a long, random password to
                      stay secure.
                    </p>
                  </div>
                  <form style={styles.form} onSubmit={handlePasswordSubmit}>
                    <div style={styles.fieldRow}>
                      <label style={styles.field}>
                        Current Password
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(event) =>
                            setCurrentPassword(event.target.value)
                          }
                          required
                          style={styles.input}
                        />
                      </label>
                      <label style={styles.field}>
                        New Password
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(event) =>
                            setNewPassword(event.target.value)
                          }
                          required
                          minLength={8}
                          style={styles.input}
                        />
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={savingPassword}
                      style={styles.button}
                    >
                      <Lock size={18} />
                      {savingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                </section>

                <section style={styles.dangerZone}>
                  <h2 style={styles.dangerTitle}>Delete Account</h2>
                  <p style={styles.panelDescription}>
                    Once you delete your account, there is no going back. All of
                    your ratings, reviews, and watchlist data will be
                    permanently erased.
                  </p>
                  <button
                    type="button"
                    style={styles.dangerButton}
                    onClick={handleDeleteAccount}
                  >
                    <Trash2 size={18} />
                    Delete My Account
                  </button>
                </section>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
