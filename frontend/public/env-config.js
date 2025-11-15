// Default runtime configuration for the SPA. This may be replaced at runtime by the container
// (e.g., using a small entrypoint script) so the API URL can be configured without rebuilding
// the static assets.
window.__RUNTIME_CONFIG__ = {
  VITE_API_URL: "http://localhost:8000",
};
