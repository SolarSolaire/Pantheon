import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquareText } from "lucide-react";
import { isAuthenticated } from "../utils/auth";
import {
  deleteUserReview,
  fetchUserReviews,
  fetchUserProfile,
  logoutUser,
  saveUserReview
} from "../api/userData";
import useUserRatings from "../hooks/useUserRatings";
import useUserWatchlist from "../hooks/useUserWatchlist";
import Navbar from "../components/Navbar";
import ReviewCard from "../components/ReviewCard";
import ReviewComposerDialog from "../components/ReviewComposerDialog";

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px clamp(20px, 5vw, 72px)"
  },
  title: {
    margin: "0 0 24px",
    color: "#f5f3ef",
    fontSize: "1.8rem",
    fontWeight: 800
  },
  message: {
    marginBottom: "18px",
    padding: "16px",
    border: "1px solid #2b2931",
    borderRadius: "10px",
    backgroundColor: "#19181e",
    color: "#aaa7b2",
    textAlign: "center"
  },
  error: {
    borderColor: "#6a3338",
    backgroundColor: "#2e1a1c",
    color: "#ffb4b4"
  },
  empty: {
    padding: "56px 20px",
    border: "1px solid #2b2931",
    borderRadius: "12px",
    backgroundColor: "#19181e",
    textAlign: "center"
  },
  emptyTitle: {
    margin: "14px 0 6px",
    color: "#f5f3ef",
    fontSize: "1.15rem"
  },
  emptySubtitle: {
    margin: 0,
    color: "#aaa7b2"
  },
  list: {
    display: "grid",
    gap: "18px"
  }
};

export default function Reviews() {
  const navigate = useNavigate();
  // New state to hold the current user's profile data
  const [currentUser, setCurrentUser] = useState(null);
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingReview, setEditingReview] = useState(null);
  const { userRatings, ratingsError, handleSaveRating } =
    useUserRatings();
  const {
    userTitles,
    watchlistError,
    handleToggleWatched,
    markMovieReviewed,
    unmarkMovieReviewed
  } = useUserWatchlist();

  // Authentication and user loading effect
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

  async function markMovieWatched(movie) {
    const userTitle = userTitles.find(
      (title) => String(title.id) === String(movie.id)
    );
    if (userTitle?.watched) return true;
    return handleToggleWatched(movie);
  }

  useEffect(() => {
    const controller = new AbortController();
    fetchUserReviews(controller.signal)
      .then(setReviews)
      .catch((loadError) => {
        if (!controller.signal.aborted) {
          setError(loadError.message || "Could not load your reviews.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  async function handleSave(movie, reviewText) {
    const savedReview = await saveUserReview(movie, reviewText);
    markMovieReviewed(movie.id);
    setReviews((previous) => [
      savedReview,
      ...previous.filter((review) => String(review.movie_id) !== String(movie.id))
    ]);
    setError("");
    return savedReview;
  }

  async function handleDelete(movieId) {
    try {
      await deleteUserReview(movieId);
      unmarkMovieReviewed(movieId);
      setReviews((previous) =>
        previous.filter((review) => String(review.movie_id) !== String(movieId))
      );
      setError("");
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete your review.");
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
        // Pass the fetched user's name (or username) to the Navbar
        userName={currentUser?.name || currentUser?.username}
        actions={[
          { label: "Home", onClick: () => navigate("/home") },
          { label: "Watchlist", onClick: () => navigate("/watchlist") },
          { label: "Reviews", onClick: () => navigate("/reviews") },
          { label: "Account", onClick: () => navigate("/profile") },
          { label: "Logout", onClick: handleAuthAction }
        ]}
      />
      <main style={styles.container}>
        <h1 style={styles.title}>My Reviews</h1>
        {error && <div style={{ ...styles.message, ...styles.error }}>{error}</div>}
        {ratingsError && (
          <div style={{ ...styles.message, ...styles.error }}>{ratingsError}</div>
        )}
        {watchlistError && (
          <div style={{ ...styles.message, ...styles.error }}>{watchlistError}</div>
        )}
        {loading && <div style={styles.message}>Loading your reviews...</div>}
        {!loading && !error && reviews.length === 0 && (
          <div style={styles.empty}>
            <MessageSquareText size={42} color="#f4c96b" />
            <h2 style={styles.emptyTitle}>You have not written any reviews yet</h2>
            <p style={styles.emptySubtitle}>
              Open a movie card and click its rating star to rate or write a review.
            </p>
          </div>
        )}
        {!loading && reviews.length > 0 && (
          <div style={styles.list}>
            {reviews.map((review) => (
              <ReviewCard
                key={review.review_id}
                review={review}
                userRating={userRatings[review.movie_id]}
                onEdit={setEditingReview}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
      {editingReview && (
        <ReviewComposerDialog
          movie={editingReview.movie_data}
          productionCompany={editingReview.movie_data?.production_company}
          initialReview={editingReview.review_text}
          userRating={
            userRatings[editingReview.movie_id] ?? editingReview.user_rating
          }
          onSaveRating={handleSaveRating}
          onMarkWatched={markMovieWatched}
          onSave={handleSave}
          onClose={() => setEditingReview(null)}
        />
      )}
    </div>
  );
}