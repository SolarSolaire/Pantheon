import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Film, User } from "lucide-react";
import SearchBar from "./SearchBar";

const navbarStyles = {
  container: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    minHeight: "72px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
    padding: "12px clamp(20px, 5vw, 72px)",
    backgroundColor: "rgba(16, 16, 20, 0.94)",
    backdropFilter: "blur(14px)",
    borderBottom: "1px solid #29282e"
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#f4c96b",
    fontSize: "1.35rem",
    fontWeight: "800",
    letterSpacing: "0.04em",
    textDecoration: "none",
    whiteSpace: "nowrap"
  },
  actions: {
    display: "flex",
    alignItems: "center",
    flex: "1 1 auto", 
    justifyContent: "flex-end", 
    flexWrap: "wrap",
    gap: "10px",
    minWidth: "320px" 
  },
  // Base button styling
  button: {
    padding: "10px 16px",
    border: "1px solid #44414b",
    borderRadius: "9px",
    fontSize: "inherit",
    fontWeight: "700",
    backgroundColor: "#242229",
    color: "#f0edf4",
    cursor: "pointer",
    transition: "all 0.15s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap"
  },
  // Gold highlighted state for the active tab
  buttonActive: {
    backgroundColor: "rgba(244, 201, 107, 0.14)",
    borderColor: "#f4c96b",
    color: "#f4c96b",
    boxShadow: "0 0 8px rgba(244, 201, 107, 0.25)"
  },
  // Subtle red state for the logout button
  buttonLogout: {
    backgroundColor: "rgba(255, 77, 77, 0.08)",
    borderColor: "#6a3338",
    color: "#ffb4b4",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#f0edf4",
    fontWeight: "600",
    fontSize: "0.95rem",
  },
  avatar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    backgroundColor: "#3a3642",
    borderRadius: "50%",
    color: "#f4c96b"
  }
};

export default function Navbar({ searchProps = {}, showSearch = true, actions = [], userName }) {
  const navigate = useNavigate();
  const location = useLocation(); // Gets the current URL path
  const [localSearch, setLocalSearch] = useState("");
  const searchValue = searchProps.value ?? localSearch;
  const handleSearchChange = searchProps.onChange ?? setLocalSearch;

  function handleSearchSubmit(event) {
    if (searchProps.onSubmit) {
      searchProps.onSubmit(event);
      return;
    }

    const query = searchValue.trim();
    navigate(query ? `/search?query=${encodeURIComponent(query)}` : "/search");
  }

  // Helper to figure out if a button should be highlighted based on the current URL
  function checkIsActive(label) {
    const currentPath = location.pathname.toLowerCase();
    
    // Account maps to /profile, everything else maps to its own name
    if (label === "Account" && currentPath.includes("/profile")) return true;
    if (label !== "Account" && label !== "Logout" && currentPath.includes(`/${label.toLowerCase()}`)) return true;
    
    return false;
  }

  return (
    <header style={navbarStyles.container}>
      <a
        style={navbarStyles.brand}
        href="/home"
        onClick={(event) => {
          event.preventDefault();
          navigate("/home");
        }}
      >
        <Film size={22} />
        <span>Pantheon</span>
      </a>
      <div style={navbarStyles.actions}>
        {showSearch && (
          <SearchBar
            {...searchProps}
            value={searchValue}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />
        )}
        {actions.map(({ label, onClick }) => {
          const isActive = checkIsActive(label);
          const isLogout = label === "Logout";

          // Dynamically combine styles based on the button's purpose
          const combinedStyle = {
            ...navbarStyles.button,
            ...(isActive ? navbarStyles.buttonActive : {}),
            ...(isLogout ? navbarStyles.buttonLogout : {})
          };

          return (
            <button
              key={label}
              type="button"
              style={combinedStyle}
              onClick={onClick}
            >
              {label}
            </button>
          );
        })}
        {userName && (
          <div style={navbarStyles.userInfo}>
            <div style={navbarStyles.avatar}>
              <User size={16} />
            </div>
            <span>{userName}</span>
          </div>
        )}
      </div>
    </header>
  );
}