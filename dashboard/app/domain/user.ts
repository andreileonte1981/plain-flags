export enum Role {
    SUPERADMIN = "superadmin",
    ADMIN = "admin",
    USER = "user",
    DEMO = "demo"
}

export interface User {
    id: string
    email: string
    role: Role
}