import { PrimaryGeneratedColumn, UpdateDateColumn, getManager, BeforeInsert, BeforeUpdate } from "typeorm";
import { validate } from "class-validator";

export default abstract class Base<T> {
    @PrimaryGeneratedColumn()
    public id: number

    @UpdateDateColumn({ precision: 6, type: "timestamp", nullable: true })
    public updatedAt: Date

    public async save(): Promise<T> {
        //@ts-ignore
        return getManager().save<T>(this as T)
    }
}