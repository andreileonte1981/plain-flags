import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum Role {
    SUPERADMIN = "superadmin",
    ADMIN = "admin",
    USER = "user"
}

@Entity()
export default class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    email: string = "";

    @Column()
    password: string = ""

    @Column({ default: Role.USER })
    role: Role = Role.USER
}
