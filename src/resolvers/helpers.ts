import {
	ClassType,
	Resolver,
	Query,
	Arg,
	ArgsType,
	Field,
	Int,
	Args,
	ObjectType,
	Authorized,
	registerEnumType,
} from 'type-graphql';
import { getManager } from 'typeorm';
import { AuthRoles } from '../interfaces/AuthRoles';

enum PaginationSortDirections {
	ASC = 'ASC',
	DESC = 'DESC',
}

registerEnumType(PaginatedResponse, {
	name: 'Sortdirections',
});

@ArgsType()
export class PaginationArgs<T> {
	@Field((type) => Int, { nullable: true })
	cursor: number;

	@Field((type) => Int, { nullable: true })
	limit?: number;

	@Field((type) => String, { nullable: true })
	sortBy?: keyof T;

	@Field({ nullable: true })
	sortDirection?: PaginationSortDirections;
}

export function PaginatedResponse<TItem>(TItemClass: ClassType<TItem>) {
	// `isAbstract` decorator option is mandatory to prevent registering in schema
	@ObjectType({ isAbstract: true })
	abstract class PaginatedResponseClass {
		@Field((type) => [TItemClass])
		items: TItem[];

		@Field((type) => Int)
		total: number;

		@Field((type) => Int)
		cursor: number;

		@Field()
		hasMore: boolean;
	}
	return PaginatedResponseClass;
}

export function createResolver<T extends ClassType>(
	suffix: string,
	objectTypes: T,
	getAuthRoles: AuthRoles[],
	relations: string[] = []
) {
	@ObjectType(`PaginationResponse${suffix}`)
	class PaginationResponse extends PaginatedResponse(objectTypes) {}

	@Resolver({ isAbstract: true })
	abstract class BaseResolver {
		//@Authorized(getAuthRoles)
		@Query((type) => PaginationResponse, { name: `getAll${suffix}s` })
		public async getAll(
			@Args() { cursor, limit, sortBy, sortDirection }: PaginationArgs<T>
		): Promise<PaginationResponse> {
			const qb = getManager().getRepository(objectTypes).createQueryBuilder();
			for (const relation of relations) {
				qb.leftJoinAndSelect(`${objectTypes.prototype.constructor.name}.${relation}`, relation);
			}

			qb.skip(cursor);
			if (limit) qb.take(limit);
			if (sortBy) qb.orderBy(sortBy as string, sortDirection);

			const count = await getManager().getRepository(objectTypes).count();

			let nextCursor = cursor + (limit || 0);
			if (nextCursor > count) {
				nextCursor = count;
			}
			return {
				total: count,
				cursor: nextCursor,
				hasMore: nextCursor !== count,
				items: await qb.getMany(),
			};
		}

		@Authorized(getAuthRoles)
		@Query((type) => objectTypes, { name: `get${suffix}`, nullable: true })
		public async get(@Arg('id', (type) => Int) id: number): Promise<T | null> {
			return getManager().getRepository(objectTypes).findOne(id, { relations });
		}
	}

	return BaseResolver;
}

export async function resolveEntity<T>(entity: string, id: number): Promise<T> {
	const obj = await getManager()
		.getRepository<T>(entity)
		.createQueryBuilder()
		.where('id = :id', { id })
		.getOne();
	if (!obj) throw new Error(`${entity} with id ${id} not found`);
	return obj;
}

export async function resolveEntityArray<T>(entity: string, ids: number[]): Promise<T[]> {
	if (ids.length == 0) {
		return [];
	}
	return getManager()
		.getRepository<T>(entity)
		.createQueryBuilder()
		.where('id IN (:ids)', { ids })
		.getMany();
}
