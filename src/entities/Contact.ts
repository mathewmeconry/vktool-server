import { Entity, Column, OneToMany, JoinColumn, ManyToOne, ManyToMany, OneToOne, JoinTable, AfterLoad, getManager, BeforeUpdate, BeforeInsert, AfterInsert, AfterUpdate } from "typeorm";
import BexioBase from "./BexioBase";
import Compensation from "./Compensation";
import User from "./User";
import ContactType from "./ContactType";
import ContactGroup from "./ContactGroup";
import CollectionPoint from "./CollectionPoint";
import ContactExtension, { ContactExtensionInterface } from "./ContactExtension";
import { IsString, IsDate, IsOptional, IsEmail, IsPhoneNumber } from "class-validator";

@Entity()
export default class Contact extends BexioBase<Contact> {
    @Column('text')
    @IsString()
    public nr: string

    @ManyToOne(type => ContactType, { eager: true })
    @JoinColumn()
    public contactType: ContactType

    @Column('text')
    @IsString()
    public firstname: string

    @Column('text')
    @IsString()
    public lastname: string

    @Column('date')
    @IsDate()
    public birthday: Date

    @Column('text')
    @IsString()
    public address: string

    @Column('text')
    @IsString()
    public postcode: string

    @Column('text')
    @IsString()
    public city: string

    @Column('text')
    @IsString()
    public mail: string

    @Column('text', { nullable: true })
    @IsOptional()
    @IsEmail()
    public mailSecond?: string

    @Column('text', { nullable: true })
    @IsOptional()
    @IsString()
    public phoneFixed?: string

    @Column('text', { nullable: true })
    @IsOptional()
    @IsString()
    public phoneFixedSecond?: string

    @Column('text', { nullable: true })
    @IsOptional()
    @IsString()
    public phoneMobile?: string

    @Column('text', { nullable: true })
    @IsOptional()
    @IsString()
    public remarks?: string

    @ManyToMany(type => ContactGroup, { eager: true })
    @JoinTable()
    public contactGroups: Array<ContactGroup>

    @Column('int')
    public ownerId: number

    @OneToMany(type => Compensation, compensation => compensation.member, { nullable: true })
    public compensations: Promise<Array<Compensation<any>>>

    @OneToOne(type => User, user => user.bexioContact, { nullable: true })
    public user?: User

    // custom fields stored in contactExtension entity
    public rank?: string
    public functions?: Array<string>
    public collectionPoint?: CollectionPoint
    public entryDate?: Date
    public exitDate?: Date
    public bankName?: string
    public iban?: string
    public accountHolder?: string

    public isMember(): boolean {
        return (this.contactGroups.find(group => group.bexioId === 7)) ? true : false
    }

    public getRank(): ContactGroup | null {
        const rankGroups = [17, 13, 11, 12, 28, 29, 15, 27, 26, 10, 14]

        if (this.contactGroups) {
            return this.contactGroups.find(group => rankGroups.indexOf(group.bexioId) > -1) || null
        }

        return null
    }

    public getFunctions(): Array<ContactGroup> {
        const functionGroups = [22, 9, 16]

        if (this.contactGroups) {
            return this.contactGroups.filter(group => functionGroups.indexOf(group.bexioId) > -1)
        }

        return []
    }

    public async save(): Promise<Contact> {
        await super.save()
        await this.storeOverride()
        return this
    }

    @AfterLoad()
    private async loadOverride(): Promise<boolean> {
        let override = await getManager().getRepository(ContactExtension).findOne({ contactId: this.id })
        if (override) {
            for (let i in ContactExtensionInterface) {
                if (override.hasOwnProperty(i)) {
                    //@ts-ignore
                    this[i] = override[i]
                }
            }
        }

        this.rank = (this.getRank() || { name: '' }).name
        this.functions = this.getFunctions().map(func => func.name)

        return true
    }

    @AfterLoad()
    private ajustDates(): void {
        this.birthday = new Date(this.birthday)
    }

    @AfterInsert()
    @AfterUpdate()
    public async storeOverride(): Promise<boolean> {
        let override = await getManager().getRepository(ContactExtension).findOne({ contactId: this.id })
        if (!override || Object.keys(override).length < 1) override = new ContactExtension()

        override.contact = this

        for (let i in ContactExtensionInterface) {
            if (this.hasOwnProperty(i)) {
                //@ts-ignore
                override[i] = this[i]
            }
        }

        override.save()
        return true
    }
}