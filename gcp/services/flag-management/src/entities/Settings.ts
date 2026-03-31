import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("settings")
export default class Settings extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ default: 0 })
    offsetDays: number = 0;
}
