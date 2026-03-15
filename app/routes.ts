import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("book/:id", "routes/book.$id.tsx"),
] satisfies RouteConfig;
