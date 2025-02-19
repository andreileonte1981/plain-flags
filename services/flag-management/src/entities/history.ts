import { BaseEntity, Column, CreateDateColumn, Entity, EntitySubscriberInterface, EventSubscriber, Index, InsertEvent, PrimaryGeneratedColumn } from "typeorm";
import { StateBroadcaster } from "../stateBroadcaster";

@Entity()
export default class History extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column()
    @Index()
    flagId!: string;

    @Column()
    flagName: string = ""

    @Column()
    userId!: string;

    @Column()
    userEmail: string = ""

    @Column()   // See enums. Try to store as numbers for saving space, these will get numerous
    what!: "create" | "archive" | "turnon" | "turnoff" | "link" | "unlink"

    @Column({ nullable: true })
    constraintId?: string

    @Column({ nullable: true })
    constraintInfo?: string

    @CreateDateColumn()
    when!: Date;
}

@EventSubscriber()
export class HistorySubscriber implements EntitySubscriberInterface {
    listenTo() { return History }

    async afterInsert(event: InsertEvent<History>) {
        StateBroadcaster.broadcastState()
    }
}
