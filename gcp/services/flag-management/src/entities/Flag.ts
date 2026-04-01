import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    UpdateEvent,
} from "typeorm";
import Settings from "./Settings";
import Constraint from "./Constraint";

async function getVirtualNow(): Promise<Date> {
    if (process.env.NODE_ENV === "production") {
        return new Date();
    }
    const settings = await Settings.find();
    const offsetDays = settings[0]?.offsetDays ?? 0;
    const now = new Date();
    now.setTime(now.getTime() + offsetDays * 24 * 60 * 60 * 1000);
    return now;
}

@Entity("flags")
export default class Flag extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    name!: string;

    @Column({ default: false })
    isOn: boolean = false;

    @Column({ default: false })
    isArchived: boolean = false;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @ManyToMany(() => Constraint, (constraint) => constraint.flags, { cascade: true })
    @JoinTable()
    constraints!: Constraint[];

    stale: boolean = false;

    async checkStale() {
        const now = new Date();
        const msPerDay = 1000 * 60 * 60 * 24;
        const daysDiff = (now.getTime() - this.updatedAt.getTime()) / msPerDay;
        const staleDays = parseInt(process.env.STALE_FLAG_DAYS || "2", 10);
        this.stale = daysDiff > staleDays;
    }

    unlinkConstraint(id: string) {
        this.constraints = (this.constraints as any[]).filter((c) => c.id !== id);
    }

    unlinkAllConstraints() {
        this.constraints = [];
    }
}

@EventSubscriber()
export class FlagSubscriber implements EntitySubscriberInterface<Flag> {
    listenTo() { return Flag; }

    async beforeInsert(event: InsertEvent<Flag>) {
        event.entity.updatedAt = await getVirtualNow();
    }

    async beforeUpdate(event: UpdateEvent<Flag>) {
        if (event.entity) {
            event.entity.updatedAt = await getVirtualNow();
        }
    }
}
