import {
	Resolver,
	Root,
	FieldResolver,
	InputType,
	Field,
	Mutation,
	Arg,
	Ctx,
	Authorized,
	Query,
	Int,
	ForbiddenError,
	Info,
} from 'type-graphql';
import { createResolver, resolveEntity, PaginationFilterOperator } from './helpers';
import Logoff, { LogoffState } from '../entities/Logoff';
import { registerEnumType } from 'type-graphql';
import Contact from '../entities/Contact';
import User from '../entities/User';
import { ApolloContext } from '../controllers/CliController';
import LogoffService from '../services/LogoffService';
import { AuthRoles } from '../interfaces/AuthRoles';
import AuthService from '../services/AuthService';
import { getManager } from 'typeorm';

const baseResolver = createResolver(
	'Logoff',
	Logoff,
	[AuthRoles.LOGOFFS_READ],
	['contact'],
	['contact.firstname', 'contact.lastname', 'state'],
	[
		{
			id: 0,
			field: 'Logoff.state',
			displayName: 'Offen',
			operator: PaginationFilterOperator['='],
			value: LogoffState.PENDING,
		},
		{
			id: 1,
			field: 'Logoff.state',
			displayName: 'Genehmigt',
			operator: PaginationFilterOperator['='],
			value: LogoffState.APPROVED,
		},
		{
			id: 2,
			field: 'Logoff.state',
			displayName: 'Abgelehnt',
			operator: PaginationFilterOperator['='],
			value: LogoffState.DECLINED,
		}
	]
);

registerEnumType(LogoffState, {
	name: 'LogoffState',
	description: 'Possible states for logoffs',
});

@InputType()
class AddLogoff implements Partial<Logoff> {
	@Field()
	public contactId: number;

	@Field()
	public from: Date;

	@Field()
	public until: Date;

	@Field()
	public state: LogoffState;

	@Field({ nullable: true })
	public remarks?: string;
}

@Resolver((of) => Logoff)
export default class LogoffResolver extends baseResolver {
	@Authorized([AuthRoles.AUTHENTICATED, AuthRoles.LOGOFFS_READ])
	@Query((type) => [Logoff])
	public async getContactLogoffs(
		@Arg('id', (type) => Int) id: number,
		@Ctx() ctx: ApolloContext
	): Promise<Logoff[]> {
		if (ctx.user.id !== id && !AuthService.isAuthorized(ctx.user.roles, AuthRoles.LOGOFFS_READ)) {
			throw new ForbiddenError();
		}

		return getManager()
			.getRepository(Logoff)
			.find({ where: { contact: id } });
	}

	@Authorized([AuthRoles.LOGOFFS_EDIT])
	@Mutation((type) => Logoff)
	public async deleteLogoff(
		@Arg('id', (type) => Int) id: number,
		@Arg('notify', { defaultValue: true }) notify: boolean = true,
		@Ctx() ctx: ApolloContext
	): Promise<Logoff> {
		const logoff = await getManager()
			.getRepository(Logoff)
			.findOne({ where: { id }, relations: ['contact'] });
		if (!logoff) throw new Error('Logoff not found');
		logoff.deletedAt = new Date();
		logoff.deletedBy = ctx.user;

		if (notify !== false) {
			LogoffService.sendChangeStateMail(logoff.contact, logoff);
		}

		return logoff.save();
	}

	@Authorized([AuthRoles.LOGOFFS_APPROVE])
	@Mutation((type) => Logoff)
	public async changeLogoffState(
		@Arg('id', (type) => Int) id: number,
		@Arg('state', (type) => LogoffState) state: LogoffState,
		@Arg('notify', { defaultValue: true }) notify: boolean = true,
		@Ctx() ctx: ApolloContext
	): Promise<Logoff> {
		const logoff = await getManager()
			.getRepository(Logoff)
			.findOne({ where: { id }, relations: ['contact'] });
		if (!logoff) throw new Error('Logoff not found');
		logoff.state = state.toLowerCase() as LogoffState;
		logoff.changedStateBy = ctx.user;

		if (notify !== false) {
			LogoffService.sendChangeStateMail(logoff.contact, logoff);
		}
		return logoff.save();
	}

	@Authorized([AuthRoles.LOGOFFS_CREATE])
	@Mutation((type) => [Logoff])
	public async addLogoffs(
		@Arg('data', (type) => [AddLogoff]) data: AddLogoff[],
		@Arg('notify', { defaultValue: true }) notify: boolean = true,
		@Ctx() ctx: ApolloContext
	): Promise<Logoff[]> {
		const savePromises: Promise<Logoff>[] = [];
		for (const add of data) {
			const contact = await resolveEntity<Contact>('Contact', add.contactId);
			const logoff = new Logoff(
				contact,
				add.from,
				add.until,
				add.state.toLowerCase() as LogoffState,
				add.remarks || '',
				ctx.user
			);
			savePromises.push(logoff.save());
		}

		if (notify !== false) {
			LogoffService.sendInformationMail(
				await resolveEntity<Contact>('Contact', data[0].contactId),
				await Promise.all(savePromises)
			);
		}

		return Promise.all(savePromises);
	}

	@Authorized([AuthRoles.LOGOFFS_CREATE])
	@Mutation((type) => Logoff)
	public async addLogoff(
		@Arg('data') data: AddLogoff,
		@Arg('notify', { defaultValue: true }) notify: boolean = true,
		@Ctx() ctx: ApolloContext
	): Promise<Logoff> {
		const contact = await resolveEntity<Contact>('Contact', data.contactId);
		const logoff = new Logoff(
			contact,
			data.from,
			data.until,
			data.state,
			data.remarks || '',
			ctx.user
		);

		if (notify !== false) {
			LogoffService.sendInformationMail(contact, [logoff]);
		}

		return logoff.save();
	}

	@FieldResolver()
	public async contact(@Root() object: Logoff): Promise<Contact> {
		return resolveEntity('Contact', object.contactId);
	}

	@FieldResolver()
	public async createdBy(@Root() object: Logoff): Promise<User> {
		return resolveEntity('User', object.createdById);
	}

	@FieldResolver({ nullable: true })
	public async changedStateBy(@Root() object: Logoff): Promise<User | null> {
		if (!object.changedStateById) return null;
		return resolveEntity('User', object.changedStateById);
	}

	@FieldResolver({ nullable: true })
	public async deletedBy(@Root() object: Logoff): Promise<User | null> {
		if (!object.deletedById) return null;
		return resolveEntity('User', object.deletedById);
	}
}
