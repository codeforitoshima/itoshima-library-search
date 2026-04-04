import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  plugins: [
    {
      name: "forward-host-header",
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (!req.headers["x-forwarded-host"]) {
            const host =
              req.headers.host ?? (req.headers[":authority"] as string);
            if (host) {
              req.headers["x-forwarded-host"] = host;
              req.rawHeaders.push("x-forwarded-host", host);
            }
          }
          next();
        });
      },
    },
    mkcert(),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
  server: { host: true },
});
