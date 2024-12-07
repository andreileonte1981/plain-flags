import {
    BaseEntity,
    Column,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";

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

    stale: boolean = false

    checkStale() {
        
    }
}
