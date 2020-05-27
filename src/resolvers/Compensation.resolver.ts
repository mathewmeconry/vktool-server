import CustomCompensation from '../entities/CustomCompensation';
import {
	Resolver,
	FieldResolver,
	Root,
	InputType,
	Field,
	Mutation,
	Arg,
	Ctx,
	Authorized,
	Query,
	registerEnumType,
	Int,
	ForbiddenError,
} from 'type-graphql';
import { createResolver, resolveEntity } from './helpers';
import Compensation from '../entities/Compensation';
import Contact from '../entities/Contact';
import User from '../entities/User';
import Payout from '../entities/Payout';
import { ApolloContext } from '../controllers/CliController';
import OrderCompensation from '../entities/OrderCompensation';
import { AuthRoles } from '../interfaces/AuthRoles';
import AuthService from '../services/AuthService';
import { getManager } from 'typeorm';

const baseResolver = createResolver('Compensation', Compensation, [AuthRoles.COMPENSATIONS_READ]);

registerEnumType(AuthRoles, {
	name: 'Authroles',
});
@Resolver((of) => Compensation)
export default class CompensationResolver extends baseResolver {
	@Authorized([AuthRoles.AUTHENTICATED, AuthRoles.COMPENSATIONS_READ])
	@Query((type) => [Compensation])
	public async getContactCompensations(
		@Arg('id', (type) => Int) id: number,
		@Ctx() ctx: ApolloContext,
		@Arg('payoutId', (type) => Int, { nullable: true }) payoutId?: number
	): Promise<Compensation<any>[]> {
		if (
			ctx.user.id !== id &&
			!AuthService.isAuthorized(ctx.user.roles, AuthRoles.COMPENSATIONS_READ)
		) {
			throw new ForbiddenError();
		}

		const filter: { member: number; approved: boolean; payout?: number } = {
			member: id,
			approved: true,
		};
		if (payoutId) {
			filter['payout'] = payoutId;
		}

		const customs = await getManager().getRepository(CustomCompensation).find({ where: filter });
		const orders = await getManager().getRepository(OrderCompensation).find({ where: filter });
		return customs.concat(orders);
	}

	@Authorized([AuthRoles.COMPENSATIONS_EDIT])
	@Mutation((type) => Compensation)
	public async deleteCompensation(
		@Arg('id', (type) => Int) id: number,
		@Ctx() ctx: ApolloContext
	): Promise<Compensation<any>> {
		let comp: Compensation<any>;

		try {
			comp = await resolveEntity<CustomCompensation>('CustomCompensation', id);
		} catch (e) {
			comp = await resolveEntity<OrderCompensation>('OrderCompensation', id);
		}

		comp.deletedAt = new Date();
		comp.deletedBy = ctx.user;
		return comp.save();
	}

	@Authorized([AuthRoles.COMPENSATIONS_APPROVE])
	@Mutation((type) => Compensation)
	public async approveCompensation(
		@Arg('id', (type) => Int) id: number,
		@Ctx() ctx: ApolloContext
	): Promise<Compensation<any>> {
		let comp: Compensation<any>;
		try {
			comp = await resolveEntity<CustomCompensation>('CustomCompensation', id);
		} catch (e) {
			comp = await resolveEntity<OrderCompensation>('OrderCompensation', id);
		}

		comp.approved = true;
		comp.approvedBy = ctx.user;
		return comp.save();
	}

	@FieldResolver()
	public async member(@Root() object: Compensation<any>): Promise<Contact> {
		return resolveEntity('Contact', object.memberId);
	}

	@FieldResolver()
	public async creator(@Root() object: Compensation<any>): Promise<User> {
		return resolveEntity('User', object.creatorId);
	}

	@FieldResolver({ nullable: true })
	public async approvedBy(@Root() object: Compensation<any>): Promise<User | null> {
		if (!object.approvedById) return null;
		return resolveEntity('User', object.approvedById);
	}

	@FieldResolver({ nullable: true })
	public async payout(@Root() object: Compensation<any>): Promise<Payout | null> {
		if (!object.payoutId) return null;
		return resolveEntity('Payout', object.payoutId);
	}

	@FieldResolver({ nullable: true })
	public async transferCompensation(
		@Root() object: Compensation<any>
	): Promise<Compensation<CustomCompensation> | null> {
		if (!object.transferCompensationId) return null;
		return resolveEntity('transferCompensation', object.transferCompensationId);
	}

	@FieldResolver({ nullable: true })
	public async updatedBy(@Root() object: Compensation<any>): Promise<User | null> {
		if (!object.updatedById) return null;
		return resolveEntity('User', object.updatedById);
	}

	@FieldResolver({ nullable: true })
	public async deletedBy(@Root() object: Compensation<any>): Promise<User | null> {
		if (!object.deletedById) return null;
		return resolveEntity('User', object.deletedById);
	}
}
