import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("ui/routes/index.tsx"),
    layout("ui/layouts/dashboard.tsx", [
        route("flags", "ui/routes/flags/flags.tsx"),
        route("archived", "ui/routes/flags/archived.tsx"),
        route("constraints", "ui/routes/constraints/constraints.tsx"),
        route("flags/:flagId", "ui/routes/flags/flag.tsx"),
        route("users", "ui/routes/users/users.tsx"),
        route("demo/success", "ui/routes/demo/success.tsx"),
    ]),
    route("login", "ui/routes/login.tsx"),
    route("register", "ui/routes/register.tsx"),
    route("demo", "ui/routes/demo/demo.tsx"),
] satisfies RouteConfig;
