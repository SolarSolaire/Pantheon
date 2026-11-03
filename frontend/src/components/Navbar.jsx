import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Film } from "lucide-react";
import SearchBar from "./SearchBar";

const navbarStyles = {
  container: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    minHeight: "72px",
    display: "flex",
    alignItems: "center",
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
    flex: "1 1 420px",
    justifyContent: "flex-end",
    gap: "10px",
    minWidth: 0
  },
  button: {
    padding: "10px 16px",
    border: "1px solid #44414b",
    borderRadius: "9px",
    fontSize: "inherit",
    fontWeight: "700",
    backgroundColor: "#242229",
    color: "#f0edf4",
    cursor: "pointer",
    transition: "transform 0.15s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap"
  }
};

export default function Navbar({ searchProps = {}, showSearch = true, actions = [] }) {
  const navigate = useNavigate();
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
        {actions.map(({ label, onClick }) => (
          <button
            key={label}
            type="button"
            style={navbarStyles.button}
            onClick={onClick}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}
