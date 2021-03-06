import { Entity, Column, OneToOne, JoinColumn, AfterLoad, RelationId, Index } from 'typeorm';
import Base from './Base';
import Contact from './Contact';
import { AuthRolesByRank, AuthRolesByFunction, AuthRoles } from '../interfaces/AuthRoles';
import { IsString, IsOptional } from 'class-validator';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
@Entity()
export default class User extends Base<User> {
	@Field({ nullable: true })
	@Column('text', { nullable: true })
	public outlookId?: string;

	@Field({ nullable: true })
	@Column('text', { nullable: true })
	public accessToken?: string;

	@Field({ nullable: true })
	@Column('text', { nullable: true })
	public refreshToken?: string;

	@Index({ fulltext: true })
	@Field()
	@Column('text')
	public displayName: string;

	@Field((type) => [AuthRoles])
	@Column('simple-array')
	public roles: AuthRoles[];

	@Field()
	@Column({ precision: 6, type: 'timestamp' })
	public lastLogin: Date;

	@Field((type) => Contact, { nullable: true })
	@OneToOne((type) => Contact, (contact) => contact.user, { nullable: true })
	@JoinColumn()
	public bexioContact?: Contact;

	@RelationId('bexioContact')
	public bexioContactId?: number;

	@Field()
	public provider: string;

	public save(): Promise<User> {
		this.enrichPermissions();
		return super.save();
	}

	@AfterLoad()
	public async enrichPermissions(): Promise<void> {
		if (this.bexioContact && typeof this.bexioContact.getRank === 'function') {
			const rank = (await this.bexioContact.getRank()) || { bexioId: -1 };
			this.roles = this.roles.concat(AuthRolesByRank[rank.bexioId] || []);
		}

		if (this.bexioContact && typeof this.bexioContact.getFunctions === 'function') {
			for (let func of await this.bexioContact.getFunctions()) {
				this.roles = this.roles.concat(AuthRolesByFunction[func.bexioId]);
			}
		}

		this.roles = this.roles.filter((element, index, arr) => arr.indexOf(element) === index);
		// filters out old permissions
		// @ts-ignore
		this.roles = this.roles.filter((element) => AuthRoles[element.toUpperCase()] !== undefined);
	}
}
