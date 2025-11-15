#!/bin/sh
set -e

# Default to the backend container's hostname if not provided by the container runtime
: ${VITE_API_URL:=http://backend:8000}

cat > /usr/share/nginx/html/env-config.js <<EOF
window.__RUNTIME_CONFIG__ = {
  VITE_API_URL: "${VITE_API_URL}"
};
EOF

# Exec the given command (happens to be `nginx -g 'daemon off;'`)
exec "$@"
