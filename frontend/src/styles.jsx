import React from "react";

const styles = {
  // Reusable authentication screen and form styles.
  auth: {
    // Centers the authentication screen and sets its page spacing.
    authPage: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    },
    // Defines the split-screen authentication card.
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
    // Styles the branding panel on authentication screens.
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
    // Spaces the authentication branding content.
    authBrandContent: {
      marginTop: "20px"
    },
    // Aligns the logo and wordmark in authentication headers.
    authLogoRow: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "24px"
    },
    // Styles the authentication wordmark.
    authLogoText: {
      color: "#f4c96b",
      fontSize: "1.6rem",
      fontWeight: "800",
      letterSpacing: "0.1em"
    },
    // Styles the main authentication branding heading.
    authBrandTitle: {
      fontSize: "2.4rem",
      fontWeight: "800",
      margin: "0 0 16px 0",
      color: "#f5f3ef",
      letterSpacing: "-0.03em",
      lineHeight: "1.1"
    },
    // Styles the supporting authentication branding text.
    authBrandSubtitle: {
      color: "#aaa7b2",
      fontSize: "1rem",
      lineHeight: "1.6",
      margin: 0,
      maxWidth: "340px"
    },
    // Aligns the footer content in authentication panels.
    authBrandFooter: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "0.82rem",
      color: "#85818d",
      borderTop: "1px solid #29282e",
      paddingTop: "16px"
    },
    // Styles the authentication form panel.
    authFormSide: {
      padding: "48px 40px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      backgroundColor: "#19181e"
    },
    // Spaces the authentication form heading.
    authFormHeader: {
      marginBottom: "28px"
    },
    // Styles the authentication form title.
    authFormTitle: {
      fontSize: "1.75rem",
      fontWeight: "800",
      margin: "0 0 6px 0",
      color: "#f5f3ef"
    },
    // Styles the supporting authentication form text.
    authFormSubtitle: {
      fontSize: "0.9rem",
      color: "#aaa7b2",
      margin: 0
    },
    // Highlights authentication errors.
    authErrorBanner: {
      backgroundColor: "#2e1a1c",
      border: "1px solid #6a3338",
      color: "#ffb4b4",
      padding: "10px 14px",
      borderRadius: "8px",
      fontSize: "0.85rem",
      marginBottom: "20px"
    },
    // Arranges authentication form fields and controls.
    authForm: {
      display: "flex",
      flexDirection: "column",
      gap: "16px"
    },
    // Positions an authentication input and its icon.
    authInputGroup: {
      position: "relative",
      display: "flex",
      alignItems: "center"
    },
    // Positions the icon inside an authentication input.
    authInputIcon: {
      position: "absolute",
      left: "14px",
      pointerEvents: "none"
    },
    // Styles authentication text and password inputs.
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
    // Styles the primary authentication action.
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
    },
    // Styles the secondary account navigation action.
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
    },
    // Arranges secondary actions on the login screen.
    loginActionRow: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
      marginTop: "20px"
    },
    // Spaces the secondary account action row.
    newAccountActionRow: {
      display: "flex",
      marginTop: "24px"
    },
    // Frames the backend health status on the login screen.
    loginStatusBox: {
      marginTop: "24px",
      padding: "14px",
      borderRadius: "10px",
      backgroundColor: "#101014",
      border: "1px solid #29282e"
    },
    // Styles the backend status label.
    loginStatusTitle: {
      fontSize: "0.78rem",
      color: "#85818d",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      fontWeight: "700"
    },
    // Styles the backend health status message.
    loginStatusMessage: {
      margin: "4px 0 0 0",
      fontSize: "0.88rem",
      fontWeight: "600",
      color: "#f4c96b"
    },
    // Styles the new-account action on the login screen.
    newAccountButton: {
      padding: "10px",
      backgroundColor: "#242229",
      border: "1px solid #44414b",
      borderRadius: "9px",
      color: "#f0edf4",
      fontSize: "0.85rem",
      fontWeight: "700",
      cursor: "pointer",
      transition: "transform 0.15s ease"
    },
  },
  // Layout and navigation styles shared across pages.
  shared: {
    // Centers and spaces the main page content.
    container: {
      maxWidth: "1440px",
      margin: "0 auto",
      padding: "42px clamp(20px, 5vw, 72px) 70px"
    },
    // Defines the responsive movie-card grid.
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
      gap: "24px 18px"
    },
  },
  // Home page search and featured movie styles.
  home: {
    // Styles the Home movie section heading.
    sectionTitle: {
      margin: "8px 0 26px",
      fontSize: "clamp(1.7rem, 3vw, 2.35rem)",
      letterSpacing: "-0.04em"
    },
    movieSection: {
      marginBottom: "56px"
    },
    carouselFrame: {
      position: "relative"
    },
    carousel: {
      gridAutoFlow: "column",
      gridAutoColumns: "clamp(145px, 16vw, 185px)",
      gridTemplateColumns: "none",
      overflowX: "auto",
      scrollSnapType: "x mandatory",
      scrollBehavior: "smooth",
      scrollPadding: "8px 12px",
      scrollbarWidth: "none",
      padding: "12px"
    },
    carouselArrow: {
      position: "absolute",
      top: "38%",
      zIndex: 10,
      display: "grid",
      placeItems: "center",
      width: "42px",
      height: "54px",
      border: "1px solid #484550",
      borderRadius: "10px",
      backgroundColor: "rgba(16, 16, 20, 0.9)",
      color: "#f5f3ef",
      cursor: "pointer"
    },
    carouselArrowLeft: {
      left: "10px"
    },
    carouselArrowRight: {
      right: "10px"
    },
    // Centers the fallback message when a poster is missing.
    posterPlaceholder: {
      display: "grid",
      placeItems: "center",
      height: "100%",
      padding: "12px",
      color: "#aaa7b2",
      textAlign: "center"
    },
    // Frames a movie loading or status message.
    statusMessage: {
      padding: "28px",
      border: "1px solid #302e36",
      borderRadius: "12px",
      backgroundColor: "#19181e",
      color: "#c7c3ce",
      textAlign: "center"
    },
    // Applies error colors to a status message.
    errorMessage: {
      borderColor: "#6a3338",
      color: "#ffb4b4"
    },
  },
  // Movie Search page and filtering styles.
  search: {
    // Centers the Search page introduction and filters.
    heroSection: {
      textAlign: "center",
      marginBottom: "36px"
    },
    // Styles the Search page main heading.
    heroTitle: {
      fontSize: "clamp(2rem, 4vw, 3rem)",
      fontWeight: "800",
      margin: "0 0 10px 0",
      color: "#f5f3ef",
      letterSpacing: "-0.04em"
    },
    // Styles the Search page supporting text.
    heroSubtitle: {
      fontSize: "1rem",
      color: "#aaa7b2",
      margin: "0 0 28px 0"
    },
    // Arranges the genre and sorting controls.
    filterBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "16px",
      maxWidth: "1050px",
      margin: "0 auto"
    },
    // Arranges the movie genre filter buttons.
    genrePills: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap"
    },
    // Styles an inactive movie genre filter.
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
    // Highlights the selected movie genre filter.
    genrePillActive: {
      backgroundColor: "#f4c96b",
      borderColor: "#f4c96b",
      color: "#17140d"
    },
    // Aligns the movie sorting controls.
    sortWrapper: {
      display: "flex",
      alignItems: "center",
      gap: "8px"
    },
    // Styles the movie sorting label.
    sortLabel: {
      fontSize: "13px",
      color: "#aaa7b2"
    },
    // Styles the movie sort selection control.
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
    // Separates the search result summary from the grid.
    resultsHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #29282e",
      paddingBottom: "14px",
      marginBottom: "28px"
    },
    // Styles the number of matching movies.
    resultsCount: {
      margin: 0,
      fontSize: "0.9rem",
      color: "#aaa7b2"
    },
    // Styles the Search page catalog status notice.
    apiNotice: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "0.85rem",
      color: "#f4c96b"
    },
    // Frames the no-results message and reset action.
    emptyState: {
      textAlign: "center",
      padding: "64px 20px",
      backgroundColor: "#19181e",
      borderRadius: "12px",
      border: "1px solid #2b2931"
    },
    // Styles the no-results heading.
    emptyTitle: {
      fontSize: "1.15rem",
      color: "#f5f3ef",
      margin: "16px 0 6px 0"
    },
    // Styles the no-results guidance.
    emptySubtitle: {
      fontSize: "0.9rem",
      color: "#aaa7b2",
      margin: "0 0 20px 0"
    },
    // Styles the search filters reset action.
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
  },
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

export default styles;
