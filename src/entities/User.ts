import { Entity, Column, OneToOne, JoinColumn, AfterLoad } from "typeorm";
import Base from "./Base";
import Contact from "./Contact";
import { AuthRolesByRank } from "../interfaces/AuthRoles";
import { IsString, IsOptional } from "class-validator";

@Entity()
export default class User extends Base<User> {
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

    @AfterLoad()
    public enrichPermissions(): void {
        if (this.bexioContact && typeof this.bexioContact.getRank === 'function') {
            const rank = this.bexioContact.getRank() || { bexioId: -1 }
            this.roles = this.roles.concat(AuthRolesByRank[rank.bexioId] || [])
            this.roles = this.roles.filter((element, index, arr) => arr.indexOf(element) === index)
        }
    }
}