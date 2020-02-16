import { PrimaryGeneratedColumn, UpdateDateColumn, getManager, BeforeInsert, BeforeUpdate } from "typeorm";
import { validate } from "class-validator";
import escapeHtml from 'escape-html'

export default abstract class Base<T> {
    @PrimaryGeneratedColumn()
    public id: number

    @UpdateDateColumn({ precision: 6, type: "timestamp", nullable: true })
    public updatedAt: Date

    public async save(): Promise<T> {
        //@ts-ignore
        return getManager().save<T>(this as T)
    }

    @BeforeUpdate()
    public beforeUpdate(): void {
        for(const key in this) {
            // @ts-ignore
            if(this[key] === undefined && !this.hasOwnProperty(`${key}Id`)) this[key] = null
            // @ts-ignore
            if(typeof this[key] === 'string') this[key] = escapeHtml(this[key])
        }
    }
}