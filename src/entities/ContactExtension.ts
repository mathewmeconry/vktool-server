import { ManyToOne, Entity, JoinColumn, Column, OneToOne } from "typeorm";
import { IsOptional, IsDate, IsString, Validate } from 'class-validator'
import CollectionPoint from "./CollectionPoint";
import Contact from "./Contact";
import Base from "./Base";
import User from "./User";
import IsIBAN from "../validators/IsIBAN";

// needs to be kept in sync with class...
export enum ContactExtensionInterface {
    collectionPoint,
    entryDate,
    exitDate,
    bankName,
    iban,
    accountHolder
}

@Entity()
export default class ContactExtension extends Base<ContactExtension> {
    @OneToOne(type => Contact)
    @JoinColumn()
    public contact: Contact

    @Column('int', { nullable: true })
    public contactId: number

    @ManyToOne(type => CollectionPoint, { nullable: true, eager: true })
    @JoinColumn()
    public collectionPoint?: CollectionPoint

    @Column('date', { nullable: true })
    @IsOptional()
    @IsDate()
    public entryDate?: Date

    @Column('date', { nullable: true })
    @IsOptional()
    @IsDate()
    public exitDate?: Date

    @Column('text', { nullable: true })
    @IsOptional()
    @IsString()
    public bankName?: string

    @Column('text', { nullable: true })
    @IsOptional()
    @Validate(IsIBAN)
    public iban?: string

    @Column('text', { nullable: true })
    @IsOptional()
    @IsString()
    public accountHolder?: string

    @ManyToOne(type => User)
    @JoinColumn()
    public updatedBy: User
}