import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("./routes/index.tsx"),
    layout("./layouts/dashboard.tsx", [
        route("flags", "routes/flags/flags.tsx"),
        route("constraints", "./routes/constraints/constraints.tsx"),
        route("flags/:flagId", "./routes/flags/flag.tsx")
    ]),
    route("login", "./routes/login.tsx"),
    route("register", "./routes/register.tsx")
] satisfies RouteConfig;
