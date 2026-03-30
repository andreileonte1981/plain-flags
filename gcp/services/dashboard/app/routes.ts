import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("ui/routes/index.tsx"),
    route("login", "ui/routes/login.tsx"),
    layout("ui/layouts/dashboard.tsx", [
        route("flags", "ui/routes/flags.tsx"),
        route("flags/:flagId", "ui/routes/flag.tsx"),
        route("users", "ui/routes/users/users.tsx"),
        route("archived", "ui/routes/archived.tsx"),
    ]),
] satisfies RouteConfig;