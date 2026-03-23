import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

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
}