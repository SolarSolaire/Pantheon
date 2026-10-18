export function isAuthenticated() {
  return Boolean(localStorage.getItem("pantheon_token"));
}

export function clearAuthentication() {
  localStorage.removeItem("pantheon_token");
}