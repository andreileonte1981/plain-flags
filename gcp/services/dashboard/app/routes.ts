import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("ui/routes/index.tsx"),
    route("flags", "ui/routes/flags.tsx"),
] satisfies RouteConfig;