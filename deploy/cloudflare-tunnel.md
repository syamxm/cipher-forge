# Cloudflare Tunnel

You set the tunnel up manually in the Cloudflare dashboard. Point the public
hostname at whichever entry point you use:

- If Cloudflare Tunnel connects straight to the app:
  - Public hostname: `cipher-forge.syamxm.com`
  - Service: `http://localhost:8888`  (the frontend container)

- If you front it with your host Nginx (see `nginx-host.conf.example`):
  - Service: `http://localhost:80`

The frontend container serves the built React app and proxies `/api/*` to the
backend, so only the one hostname needs to be exposed.
