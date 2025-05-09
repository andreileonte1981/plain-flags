import { BaseEntity, Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import Flag from "./flag";

@Entity()
export default class Constraint extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column({ unique: true })
    description!: string

    @Column()
    key!: string

    @Column("simple-array")
    values: string[] = []

    @ManyToMany(() => Flag, (flag) => flag.constraints)
    flags!: Flag[]

    unlinkFlag(id: string) {
        this.flags = (this.flags as any[]).filter(f => f.id !== id)
    }
}