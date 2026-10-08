import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const [backendStatus, setBackendStatus] = useState(
    "Connecting to backend...",
  );

  useEffect(() => {
    // pings backend server running on port 5001
    api
      .get("/health")
      .then((res) => setBackendStatus(res.data.message))
      .catch((err) =>
        setBackendStatus(`Backend offline or CORS issue: ${err.message}`),
      );
  }, []);

  // variable declaration
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // attempts to login, navigating to the home page if successful
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("pantheon_token", res.data.token);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed.");
    }
  };

  // navigates to the new account page
  const handleNewAccount = async (e) => {
    navigate("/newaccount");
  };

  // returns the webpage in HTML
  return (
    <div style={containerStyle}>
      <h1>Pantheon Movie Tracker</h1>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin} style={formStyle}>
        <input
          type="username"
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
        <button type="submit" style={buttonStyle}>
          Log In
        </button>
      </form>
      <p style={{ color: "#666" }}>Frontend is live on port 5173!</p>

      <div
        style={{
          marginTop: "20px",
          padding: "16px",
          borderRadius: "8px",
          backgroundColor: "#f0f4f8",
          border: "1px solid #d0d7de",
        }}
      >
        <strong>Backend Status (Port 5001):</strong>
        <p style={{ margin: "8px 0 0 0", fontWeight: "bold" }}>
          {backendStatus}
        </p>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20px",
        }}
      >
        <button type="button" style={buttonStyle} onClick={handleNewAccount}>
          New to Pantheon?
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
  backgroundColor: "#007bff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  minWidth: "200px",
};
