import { PrimaryGeneratedColumn, UpdateDateColumn, getManager } from "typeorm";
import { IsNumber, validate } from "class-validator";

export default abstract class Base<T> {
    @PrimaryGeneratedColumn()
    @IsNumber()
    public id: number

    @UpdateDateColumn({ precision: 6, type: "timestamp", nullable: true })
    public updatedAt: Date

    public async save(): Promise<T> {
        const errors = await validate(this)
        if (errors.length > 0) throw errors

        //@ts-ignore
        return getManager().save<T>(this as T)
    }
}