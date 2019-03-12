import { PrimaryGeneratedColumn, UpdateDateColumn, Column } from "typeorm";

export default abstract class Base {
    @PrimaryGeneratedColumn()
    public id: number

    @Column({ precision: 6, type: "timestamp", nullable: true })
    public updatedAt: Date
}