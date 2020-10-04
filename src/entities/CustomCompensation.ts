import Compensation from './Compensation';
import Contact from './Contact';
import User from './User';
import Payout from './Payout';
import { Column, ChildEntity, Index, OneToMany, RelationId, JoinColumn } from 'typeorm';
import { IsString } from 'class-validator';
import { ObjectType, Field, Authorized } from 'type-graphql';
import MaterialChangelogToProduct from './MaterialChangelogToProduct';
import { AuthRoles } from '../interfaces/AuthRoles';

@ObjectType()
@ChildEntity()
export default class CustomCompensation extends Compensation<CustomCompensation> {
	@Index({ fulltext: true })
	@Field()
	@Column('text')
	public description: string;

	@Authorized([AuthRoles.MATERIAL_CHANGELOG_READ])
	@Field((type) => [MaterialChangelogToProduct], { nullable: true })
	@OneToMany((type) => MaterialChangelogToProduct, (mc2p) => mc2p.compensation, { nullable: true })
	@JoinColumn()
	public materialChangelogToProducts: Promise<MaterialChangelogToProduct[]>;

	@RelationId('materialChangelogToProducts')
	public materialChangelogToProductsIds: number[];

	constructor(
		member: Contact,
		creator: User,
		amount: number,
		date: Date,
		description: string,
		approved: boolean = false,
		paied: boolean = false,
		payout?: Payout
	) {
		super(member, creator, amount, date, approved, paied, payout);

		this.description = description;
	}
}
