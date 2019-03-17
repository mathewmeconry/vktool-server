import { PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export default abstract class Base {
    @PrimaryGeneratedColumn()
    public id: number

    @UpdateDateColumn({ precision: 6, type: "timestamp", nullable: true })
    public updatedAt: Date
}