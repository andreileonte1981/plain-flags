import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum Role {
    SUPERADMIN = "superadmin",
    ADMIN = "admin",
    USER = "user",
}

@Entity("users")
export default class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    firebase_uid: string = "";

    @Column({ unique: true })
    email: string = "";

    @Column({ default: Role.USER })
    role: Role = Role.USER;

    @CreateDateColumn()
    created_at!: Date;
}
