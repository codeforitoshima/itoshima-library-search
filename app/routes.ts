import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/root-redirect.tsx"),
  route(":lang", "routes/$lang.tsx", [
    index("routes/home.tsx"),
    route("book/:id", "routes/book.$id.tsx"),
    route("about", "routes/about.tsx"),
    route("contact", "routes/contact.tsx"),
  ]),
  route("api/search", "routes/api.search.ts"),
  route("api/floormap", "routes/api.floormap.ts"),
] satisfies RouteConfig;
