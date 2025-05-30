import { BaseEntity, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

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
    what!: "create" | "archive" | "turnon" | "turnoff" | "link" | "unlink" | "cvedit"

    @Column({ nullable: true })
    constraintId?: string

    @Column({ nullable: true })
    constraintInfo?: string

    @CreateDateColumn()
    when!: Date;
}
