export enum Role {
    ADMIN = "admin",
    USER = "user"
}
export interface User {
    id: string
    email: string
    role: Role
}