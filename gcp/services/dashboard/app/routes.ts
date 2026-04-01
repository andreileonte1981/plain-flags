import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("ui/routes/index.tsx"),
    route("login", "ui/routes/login.tsx"),
    layout("ui/layouts/dashboard.tsx", [
        route("flags", "ui/routes/flags/flags.tsx"),
        route("flags/:flagId", "ui/routes/flags/flag.tsx"),
        route("users", "ui/routes/users/users.tsx"),
        route("archived", "ui/routes/flags/archived.tsx"),
        route("constraints", "ui/routes/constraints/constraints.tsx"),
    ]),
] satisfies RouteConfig;