export enum Role {
    SUPERADMIN = "superadmin",
    ADMIN = "admin",
    USER = "user"
}

export interface User {
    id: string
    email: string
    role: Role
}