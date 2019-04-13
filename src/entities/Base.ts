import { PrimaryGeneratedColumn, UpdateDateColumn, getManager, BeforeInsert, BeforeUpdate } from "typeorm";
import { validate } from "class-validator";

export default abstract class Base<T> {
    @PrimaryGeneratedColumn()
    public id: number

    @UpdateDateColumn({ precision: 6, type: "timestamp", nullable: true })
    public updatedAt: Date

    public async save(): Promise<T> {
        this.nullAll()
        const errors = await validate(this)
        if (errors.length > 0) throw new Error(JSON.stringify(errors))

        //@ts-ignore
        return getManager().save<T>(this as T)
    }

    private nullAll(): void {
        for(let i in this) {
            //@ts-ignore
            if(!this[i]) this[i] = undefined
        }
    }
}