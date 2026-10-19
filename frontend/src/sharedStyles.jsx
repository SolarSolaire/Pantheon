
import React from "react";

const sharedStyles = {
  authPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px"
  },
  authCard: {
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
  authBrandSide: {
    position: "relative",
    background:
      "linear-gradient(135deg, rgba(244, 201, 107, 0.12) 0%, rgba(16, 16, 20, 0.95) 100%), #151419",
    borderRight: "1px solid #2b2931",
    padding: "48px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  authBrandContent: {
    marginTop: "20px"
  },
  authLogoRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px"
  },
  authLogoText: {
    color: "#f4c96b",
    fontSize: "1.6rem",
    fontWeight: "800",
    letterSpacing: "0.1em"
  },
  authBrandTitle: {
    fontSize: "2.4rem",
    fontWeight: "800",
    margin: "0 0 16px 0",
    color: "#f5f3ef",
    letterSpacing: "-0.03em",
    lineHeight: "1.1"
  },
  authBrandSubtitle: {
    color: "#aaa7b2",
    fontSize: "1rem",
    lineHeight: "1.6",
    margin: 0,
    maxWidth: "340px"
  },
  authBrandFooter: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.82rem",
    color: "#85818d",
    borderTop: "1px solid #29282e",
    paddingTop: "16px"
  },
  authFormSide: {
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#19181e"
  },
  authFormHeader: {
    marginBottom: "28px"
  },
  authFormTitle: {
    fontSize: "1.75rem",
    fontWeight: "800",
    margin: "0 0 6px 0",
    color: "#f5f3ef"
  },
  authFormSubtitle: {
    fontSize: "0.9rem",
    color: "#aaa7b2",
    margin: 0
  },
  authErrorBanner: {
    backgroundColor: "#2e1a1c",
    border: "1px solid #6a3338",
    color: "#ffb4b4",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "0.85rem",
    marginBottom: "20px"
  },
  authForm: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  authInputGroup: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },
  authInputIcon: {
    position: "absolute",
    left: "14px",
    pointerEvents: "none"
  },
  authInput: {
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
  authPrimaryButton: {
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
  }
};

export const movieCardStyles = {
  movieCard: {
    minWidth: 0,
    backgroundColor: "#19181e",
    borderRadius: "13px",
    overflow: "hidden",
    border: "1px solid #2b2931",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s ease, border-color 0.2s ease"
  },
  posterContainer: {
    position: "relative",
    aspectRatio: "2/3",
    backgroundColor: "#25232b",
    overflow: "hidden",
    cursor: "pointer"
  },
  posterImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block"
  },
  posterOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(16, 16, 20, 0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.2s ease"
  },
  quickViewText: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#101014",
    color: "#f5f3ef",
    padding: "8px 14px",
    borderRadius: "20px",
    fontSize: "0.82rem",
    fontWeight: "700",
    border: "1px solid #393740"
  },
  ratingBadge: {
    position: "absolute",
    top: "10px",
    left: "10px",
    backgroundColor: "rgba(16, 16, 20, 0.85)",
    color: "#f4c96b",
    padding: "6px 8px",
    borderRadius: "7px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "0.82rem",
    fontWeight: "800",
    border: "1px solid rgba(255, 255, 255, 0.15)"
  },
  genreBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "rgba(16, 16, 20, 0.85)",
    color: "#aaa7b2",
    padding: "5px 8px",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: "700",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  },
  cardBody: {
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    flex: 1
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "8px"
  },
  movieTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    margin: 0,
    color: "#f5f3ef",
    lineHeight: "1.4",
    cursor: "pointer",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  movieMeta: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "0.82rem",
    color: "#aaa7b2",
    flexShrink: 0
  },
  overviewText: {
    fontSize: "0.85rem",
    color: "#d0cdd5",
    lineHeight: "1.5",
    margin: "0 0 14px 0",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    flex: 1
  },
  userRatedBar: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#221d1b",
    border: "1px solid #553d20",
    color: "#f4c96b",
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "0.8rem",
    marginBottom: "12px",
    fontWeight: "600"
  },
  cardActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginTop: "auto"
  },
  actionButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "9px 10px",
    borderRadius: "8px",
    fontSize: "0.82rem",
    fontWeight: "700",
    cursor: "pointer",
    border: "1px solid transparent",
    transition: "transform 0.15s ease"
  },
  actionButtonSecondary: {
    backgroundColor: "#242229",
    color: "#f0edf4",
    borderColor: "#44414b"
  },
  actionButtonActive: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "#10b981",
    color: "#10b981"
  },
  actionButtonPrimary: {
    backgroundColor: "#242229",
    color: "#f5f3ef",
    borderColor: "#44414b"
  }
};

export const homeStyles = {
  navBar: {
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
  navBrand: {
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
  navActions: {
    display: "flex",
    alignItems: "center",
    flex: "1 1 420px",
    justifyContent: "flex-end",
    gap: "10px",
    minWidth: 0
  },
  searchWrap: {
    position: "relative",
    flex: "1 1 200px",
    maxWidth: "330px",
    minWidth: 0
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "0 13px",
    border: "1px solid #393740",
    borderRadius: "10px",
    backgroundColor: "#1b1a20",
    color: "#aaa7b2"
  },
  searchInput: {
    width: "100%",
    minWidth: 0,
    padding: "12px 0",
    border: 0,
    outline: 0,
    backgroundColor: "transparent",
    color: "#f5f3ef",
    font: "inherit"
  },
  clearButton: {
    display: "flex",
    alignItems: "center",
    padding: "4px",
    border: 0,
    backgroundColor: "transparent",
    color: "#85818d",
    cursor: "pointer"
  },
  suggestionsDropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    left: 0,
    zIndex: 30,
    overflow: "hidden",
    border: "1px solid #393740",
    borderRadius: "10px",
    backgroundColor: "#1b1a20",
    boxShadow: "0 14px 32px #0008"
  },
  suggestionItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "10px 12px",
    border: 0,
    borderBottom: "1px solid #302e36",
    backgroundColor: "transparent",
    color: "#f5f3ef",
    textAlign: "left",
    cursor: "pointer"
  },
  suggestionPoster: {
    flex: "0 0 34px",
    width: "34px",
    height: "48px",
    borderRadius: "4px",
    backgroundColor: "#302e36",
    objectFit: "cover"
  },
  suggestionText: {
    display: "block",
    textAlign: "left"
  },
  suggestionTitle: {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: "700"
  },
  suggestionYear: {
    display: "block",
    marginTop: "3px",
    color: "#aaa7b2",
    fontSize: "0.78rem"
  },
  suggestionStatus: {
    padding: "13px",
    color: "#aaa7b2",
    fontSize: "0.86rem"
  },
  searchSubmit: {
    padding: "11px 15px",
    border: "1px solid transparent",
    borderRadius: "9px",
    backgroundColor: "#f4c96b",
    color: "#17140d",
    font: "inherit",
    fontWeight: "700",
    whiteSpace: "nowrap",
    cursor: "pointer"
  },
  logoutBtn: {
    padding: "10px 16px",
    border: "1px solid #44414b",
    borderRadius: "9px",
    backgroundColor: "#242229",
    color: "#f0edf4",
    font: "inherit",
    fontWeight: "700",
    whiteSpace: "nowrap",
    cursor: "pointer"
  },
  container: {
    maxWidth: "1440px",
    margin: "0 auto",
    padding: "42px clamp(20px, 5vw, 72px) 70px"
  },
  sectionTitle: {
    margin: "8px 0 26px",
    fontSize: "clamp(1.7rem, 3vw, 2.35rem)",
    letterSpacing: "-0.04em"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
    gap: "24px 18px"
  },
  posterPlaceholder: {
    display: "grid",
    placeItems: "center",
    height: "100%",
    padding: "12px",
    color: "#aaa7b2",
    textAlign: "center"
  },
  statusMessage: {
    padding: "28px",
    border: "1px solid #302e36",
    borderRadius: "12px",
    backgroundColor: "#19181e",
    color: "#c7c3ce",
    textAlign: "center"
  },
  errorMessage: {
    borderColor: "#6a3338",
    color: "#ffb4b4"
  }
};

export const searchStyles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#101014",
    color: "#f5f3ef",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  navBar: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    height: "72px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 clamp(20px, 5vw, 72px)",
    backgroundColor: "rgba(16, 16, 20, 0.94)",
    backdropFilter: "blur(14px)",
    borderBottom: "1px solid #29282e"
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    color: "#f4c96b",
    fontSize: "1.35rem",
    fontWeight: "800",
    letterSpacing: "0.04em",
    textDecoration: "none"
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  accountBtn: {
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
    justifyContent: "center"
  },
  loginBtn: {
    padding: "10px 16px",
    border: "1px solid transparent",
    borderRadius: "9px",
    fontSize: "inherit",
    fontWeight: "700",
    backgroundColor: "#f4c96b",
    color: "#17140d",
    cursor: "pointer",
    transition: "transform 0.15s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center"
  },
  logoutBtn: {
    padding: "10px 16px",
    border: "1px solid transparent",
    borderRadius: "9px",
    fontSize: "inherit",
    fontWeight: "700",
    backgroundColor: "#d9534f",
    color: "#ffffff",
    cursor: "pointer",
    transition: "transform 0.15s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center"
  },
  container: {
    maxWidth: "1440px",
    margin: "0 auto",
    padding: "42px clamp(20px, 5vw, 72px) 70px"
  },
  heroSection: {
    textAlign: "center",
    marginBottom: "36px"
  },
  heroTitle: {
    fontSize: "clamp(2rem, 4vw, 3rem)",
    fontWeight: "800",
    margin: "0 0 10px 0",
    color: "#f5f3ef",
    letterSpacing: "-0.04em"
  },
  heroSubtitle: {
    fontSize: "1rem",
    color: "#aaa7b2",
    margin: "0 0 28px 0"
  },
  searchBarWrapper: {
    position: "relative",
    maxWidth: "680px",
    margin: "0 auto 28px auto"
  },
  searchIcon: {
    position: "absolute",
    left: "18px",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none"
  },
  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 44px 14px 50px",
    fontSize: "16px",
    backgroundColor: "#1b1a20",
    border: "1px solid #393740",
    borderRadius: "30px",
    color: "#f5f3ef",
    outline: "none",
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.4)"
  },
  clearButton: {
    position: "absolute",
    right: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    color: "#85818d",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "4px"
  },
  filterBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    maxWidth: "1050px",
    margin: "0 auto"
  },
  genrePills: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  genrePill: {
    backgroundColor: "#1b1a20",
    color: "#aaa7b2",
    border: "1px solid #393740",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontWeight: "600"
  },
  genrePillActive: {
    backgroundColor: "#f4c96b",
    borderColor: "#f4c96b",
    color: "#17140d"
  },
  sortWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  sortLabel: {
    fontSize: "13px",
    color: "#aaa7b2"
  },
  sortSelect: {
    backgroundColor: "#1b1a20",
    color: "#f5f3ef",
    border: "1px solid #393740",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
    outline: "none"
  },
  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #29282e",
    paddingBottom: "14px",
    marginBottom: "28px"
  },
  resultsCount: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#aaa7b2"
  },
  apiNotice: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.85rem",
    color: "#f4c96b"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
    gap: "24px 18px"
  },
  emptyState: {
    textAlign: "center",
    padding: "64px 20px",
    backgroundColor: "#19181e",
    borderRadius: "12px",
    border: "1px solid #2b2931"
  },
  emptyTitle: {
    fontSize: "1.15rem",
    color: "#f5f3ef",
    margin: "16px 0 6px 0"
  },
  emptySubtitle: {
    fontSize: "0.9rem",
    color: "#aaa7b2",
    margin: "0 0 20px 0"
  },
  resetButton: {
    backgroundColor: "#f4c96b",
    color: "#17140d",
    border: "none",
    padding: "10px 20px",
    borderRadius: "9px",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontWeight: "800"
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 50,
    backdropFilter: "blur(6px)"
  },
  modalContent: {
    backgroundColor: "#19181e",
    borderRadius: "14px",
    border: "1px solid #393740",
    maxWidth: "750px",
    width: "100%",
    padding: "28px",
    position: "relative",
    color: "#f5f3ef",
    boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
  },
  modalCloseButton: {
    position: "absolute",
    top: "16px",
    right: "16px",
    backgroundColor: "#242229",
    border: "1px solid #44414b",
    color: "#f5f3ef",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 2
  },
  modalLayout: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: "24px",
    alignItems: "start"
  },
  modalPoster: {
    width: "100%",
    aspectRatio: "2/3",
    objectFit: "cover",
    borderRadius: "10px",
    border: "1px solid #393740"
  },
  modalDetails: {
    display: "flex",
    flexDirection: "column"
  },
  modalHeaderRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "12px"
  },
  modalTitle: {
    fontSize: "1.5rem",
    fontWeight: "800",
    margin: 0,
    color: "#f5f3ef",
    lineHeight: "1.2"
  },
  modalGenreTag: {
    backgroundColor: "#242229",
    color: "#f4c96b",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "0.78rem",
    fontWeight: "700",
    border: "1px solid #44414b",
    whiteSpace: "nowrap"
  },
  modalMetaRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
    fontSize: "0.88px",
    color: "#aaa7b2"
  },
  modalRatingBox: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#242229",
    padding: "6px 12px",
    borderRadius: "8px",
    border: "1px solid #44414b"
  },
  modalRatingScore: {
    fontSize: "1.1rem",
    fontWeight: "800",
    color: "#f4c96b"
  },
  modalRatingMax: {
    fontSize: "0.8rem",
    color: "#aaa7b2"
  },
  modalDate: {
    fontSize: "0.85rem",
    color: "#aaa7b2"
  },
  synopsisHeader: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#f5f3ef",
    margin: "0 0 6px 0"
  },
  modalOverview: {
    fontSize: "0.9rem",
    color: "#d0cdd5",
    lineHeight: "1.6",
    margin: "0 0 24px 0"
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    marginTop: "auto"
  },
  modalActionButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "11px 16px",
    borderRadius: "9px",
    fontSize: "0.9rem",
    fontWeight: "700",
    cursor: "pointer",
    border: "1px solid transparent"
  },
  ratingModalContent: {
    backgroundColor: "#19181e",
    borderRadius: "14px",
    border: "1px solid #393740",
    maxWidth: "440px",
    width: "100%",
    padding: "24px",
    color: "#f5f3ef",
    boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
  },
  ratingModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px"
  },
  ratingModalTitle: {
    fontSize: "1.2rem",
    fontWeight: "800",
    margin: 0,
    color: "#f5f3ef"
  },
  ratingModalSubtitle: {
    fontSize: "0.85rem",
    color: "#aaa7b2",
    margin: "0 0 20px 0"
  },
  scoreDisplayBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    backgroundColor: "#101014",
    border: "1px solid #393740",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "20px"
  },
  scoreDisplayNumber: {
    fontSize: "2rem",
    fontWeight: "800",
    color: "#f4c96b"
  },
  scoreDisplayScale: {
    fontSize: "1rem",
    color: "#aaa7b2",
    fontWeight: "600"
  },
  decimalInputContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px"
  },
  decimalInputLabel: {
    fontSize: "0.9rem",
    fontWeight: "700",
    color: "#f5f3ef"
  },
  decimalInput: {
    flex: 1,
    backgroundColor: "#101014",
    border: "1px solid #393740",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "1rem",
    color: "#f5f3ef",
    outline: "none"
  },
  sliderContainer: {
    marginBottom: "20px"
  },
  rangeSlider: {
    width: "100%",
    accentColor: "#f4c96b",
    cursor: "pointer",
    marginBottom: "6px"
  },
  sliderTicks: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.75rem",
    color: "#85818d"
  },
  presetsWrapper: {
    marginBottom: "20px"
  },
  presetsLabel: {
    display: "block",
    fontSize: "0.8rem",
    color: "#aaa7b2",
    marginBottom: "8px"
  },
  presetsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "6px"
  },
  presetButton: {
    backgroundColor: "#242229",
    border: "1px solid #44414b",
    color: "#f5f3ef",
    borderRadius: "6px",
    padding: "6px 0",
    fontSize: "0.8rem",
    fontWeight: "700",
    cursor: "pointer"
  },
  ratingErrorText: {
    color: "#ffb4b4",
    fontSize: "0.82rem",
    marginBottom: "12px",
    margin: "0 0 12px 0"
  },
  ratingModalActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end"
  },
  clearRatingButton: {
    backgroundColor: "transparent",
    border: "1px solid #6a3338",
    color: "#ffb4b4",
    borderRadius: "8px",
    padding: "9px 14px",
    fontSize: "0.85rem",
    fontWeight: "700",
    cursor: "pointer",
    marginRight: "auto"
  },
  cancelRatingButton: {
    backgroundColor: "#242229",
    border: "1px solid #44414b",
    color: "#f0edf4",
    borderRadius: "8px",
    padding: "9px 14px",
    fontSize: "0.85rem",
    fontWeight: "700",
    cursor: "pointer"
  },
  saveRatingButton: {
    backgroundColor: "#f4c96b",
    border: "none",
    color: "#17140d",
    borderRadius: "8px",
    padding: "9px 20px",
    fontSize: "0.85rem",
    fontWeight: "800",
    cursor: "pointer"
  }
};

export const loginStyles = {
  page: sharedStyles.authPage,
  loginCard: sharedStyles.authCard,
  /* Left Branding Side */
  brandSide: sharedStyles.authBrandSide,
  brandContent: sharedStyles.authBrandContent,
  logoRow: sharedStyles.authLogoRow,
  logoText: sharedStyles.authLogoText,
  brandTitle: sharedStyles.authBrandTitle,
  brandSubtitle: sharedStyles.authBrandSubtitle,
  brandFooter: sharedStyles.authBrandFooter,
  /* Right Form Side */
  formSide: sharedStyles.authFormSide,
  formHeader: sharedStyles.authFormHeader,
  formTitle: sharedStyles.authFormTitle,
  formSubtitle: sharedStyles.authFormSubtitle,
  errorBanner: sharedStyles.authErrorBanner,
  form: sharedStyles.authForm,
  inputGroup: sharedStyles.authInputGroup,
  inputIcon: sharedStyles.authInputIcon,
  input: sharedStyles.authInput,
  primaryBtn: sharedStyles.authPrimaryButton,
  statusBox: {
    marginTop: "24px",
    padding: "14px",
    borderRadius: "10px",
    backgroundColor: "#101014",
    border: "1px solid #29282e"
  },
  statusTitle: {
    fontSize: "0.78rem",
    color: "#85818d",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: "700"
  },
  statusMessage: {
    margin: "4px 0 0 0",
    fontSize: "0.88rem",
    fontWeight: "600",
    color: "#f4c96b"
  },
  actionRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "20px"
  },
  newAccountBtn: {
    padding: "10px",
    backgroundColor: "#242229",
    border: "1px solid #44414b",
    borderRadius: "9px",
    color: "#f0edf4",
    fontSize: "0.85rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "transform 0.15s ease"
  }
};

export const newAccountStyles = {
  page: sharedStyles.authPage,
  card: sharedStyles.authCard,
  /* Left Branding Side */
  brandSide: sharedStyles.authBrandSide,
  brandContent: sharedStyles.authBrandContent,
  logoRow: sharedStyles.authLogoRow,
  logoText: sharedStyles.authLogoText,
  brandTitle: sharedStyles.authBrandTitle,
  brandSubtitle: sharedStyles.authBrandSubtitle,
  brandFooter: sharedStyles.authBrandFooter,
  /* Right Form Side */
  formSide: sharedStyles.authFormSide,
  formHeader: sharedStyles.authFormHeader,
  formTitle: sharedStyles.authFormTitle,
  formSubtitle: sharedStyles.authFormSubtitle,
  errorBanner: sharedStyles.authErrorBanner,
  form: sharedStyles.authForm,
  inputGroup: sharedStyles.authInputGroup,
  inputIcon: sharedStyles.authInputIcon,
  input: sharedStyles.authInput,
  primaryBtn: sharedStyles.authPrimaryButton,
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

export function GlobalStyles() {
  return (
    <style>{`
      :root {
        color-scheme: dark;
        --color-background: #101014;
        --color-surface: #19181e;
        --color-surface-raised: #242229;
        --color-border: #393740;
        --color-text: #f5f3ef;
        --color-text-muted: #aaa7b2;
        --color-text-subtle: #85818d;
        --color-accent: #f4c96b;
        --font-family: Inter, ui-sans-serif, system-ui, -apple-system,
          BlinkMacSystemFont, "Segoe UI", sans-serif;
        box-sizing: border-box;
      }

      *,
      *::before,
      *::after {
        box-sizing: inherit;
      }

      html,
      body,
      #root {
        width: 100%;
        min-height: 100%;
        margin: 0;
        padding: 0;
      }

      body {
        min-height: 100vh;
        background-color: var(--color-background);
        color: var(--color-text);
        font-family: var(--font-family);
      }

      input::placeholder {
        color: var(--color-text-subtle);
      }

      button:focus-visible,
      a:focus-visible,
      input:focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: 3px;
      }

      .home-suggestion-item:hover,
      .home-suggestion-item:focus-visible {
        background-color: #292730 !important;
      }
    `}</style>
  );
}

export default sharedStyles;
