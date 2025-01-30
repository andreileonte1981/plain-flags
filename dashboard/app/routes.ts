import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("ui/routes/index.tsx"),
    layout("ui/layouts/dashboard.tsx", [
        route("flags", "ui/routes/flags/flags.tsx"),
        route("constraints", "ui/routes/constraints/constraints.tsx"),
        route("flags/:flagId", "ui/routes/flags/flag.tsx")
    ]),
    route("login", "ui/routes/login.tsx"),
    route("register", "ui/routes/register.tsx")
] satisfies RouteConfig;
