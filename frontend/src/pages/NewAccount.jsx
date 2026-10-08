import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  // returns the webpage in HTML
  return (
    <div style={containerStyle}>
      <h1>Pantheon Movie Tracker</h1>
      <h2>Create New Account</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleRegister} style={formStyle}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          required
        />
        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
      >
        <button
          type="button"
          style={secondaryButtonStyle}
          onClick={() => navigate("/login")}
        >
          Already have an account? Log In
        </button>
      </div>
    </div>
  );
}

// CSS styling
const containerStyle = {
  fontFamily: "sans-serif",
  padding: "40px",
  maxWidth: "600px",
  margin: "0 auto",
};
const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginTop: "20px",
};
const inputStyle = {
  padding: "10px",
  fontSize: "16px",
  borderRadius: "4px",
  border: "1px solid #ccc",
};
const buttonStyle = {
  padding: "10px",
  fontSize: "16px",
  color: "#fff",
  backgroundColor: "#28a745",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
const secondaryButtonStyle = {
  padding: "10px",
  fontSize: "16px",
  color: "#007bff",
  backgroundColor: "transparent",
  border: "none",
  cursor: "pointer",
  textDecoration: "underline",
};
