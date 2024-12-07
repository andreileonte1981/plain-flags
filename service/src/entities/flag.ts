import {
    BaseEntity,
    Column,
    Entity,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    UpdateEvent
} from "typeorm";
import { TestableTime } from "../utils/time";

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

@EventSubscriber()
export class FlagSubscriber implements EntitySubscriberInterface {
    listenTo() { return Flag }

    async beforeInsert(event: InsertEvent<Flag>) {
        event.entity.updatedAt = await (new TestableTime()).now()
    }

    async beforeUpdate(event: UpdateEvent<Flag>) {
        if(event.entity?.updatedAt) {
            event.entity.updatedAt = await (new TestableTime()).now()        
        }
    }
}
