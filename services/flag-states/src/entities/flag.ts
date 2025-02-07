import {
    BaseEntity,
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import Constraint from "./constraint";

@Entity("flag")
export default class Flag extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column({ unique: true })
    name: string = ""

    @Column()
    isOn: boolean = false

    @Column()
    isArchived: boolean = false

    @UpdateDateColumn()
    updatedAt!: Date

    @ManyToMany(() => Constraint, (constraint) => constraint.flags)
    @JoinTable()
    constraints!: Constraint[]

    stale: boolean = false
}
