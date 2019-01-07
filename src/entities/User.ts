import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import Base from "./Base";
import Contact from "./Contact";

@Entity()
export default class User extends Base {
    @Column('text', { nullable: true })
    public outlookId?: string

    @Column('text', { nullable: true })
    public accessToken?: string

    @Column('text', { nullable: true })
    public refreshToken?: string

    @Column('text')
    public displayName: string

    @Column('simple-array')
    public roles: Array<string>

    @OneToOne(type => Contact, contact => contact.user, { nullable: true, eager: true })
    @JoinColumn()
    public bexioContact?: Contact
}