import { PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, UpdateDateColumn } from "typeorm";
import User from "./User";

export default abstract class Base {
    @PrimaryGeneratedColumn()
    public id: number

    @UpdateDateColumn()
    public updatedAt: Date
}