import {
    BaseEntity,
    Column,
    Entity,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    UpdateEvent
} from "typeorm";
import { TestableTime } from "../utils/testable-time";
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

    async checkStale() {
        const daysDifference = (new TestableTime()).daysDifference(
            new Date(),
            this.updatedAt
        )

        this.stale = daysDifference > +(process.env.STALE_FLAG_DAYS || "")
    }

    unlinkConstraint(id: string) {
        this.constraints = (this.constraints as any[]).filter(c => c.id !== id)
    }

    unlinkAllConstraints() {
        this.constraints = []
    }
}

@EventSubscriber()
export class FlagSubscriber implements EntitySubscriberInterface {
    listenTo() { return Flag }

    async beforeInsert(event: InsertEvent<Flag>) {
        event.entity.updatedAt = await (new TestableTime()).now()
    }

    async beforeUpdate(event: UpdateEvent<Flag>) {
        if (event.entity?.updatedAt) {
            event.entity.updatedAt = await (new TestableTime()).now()
        }
    }
}
