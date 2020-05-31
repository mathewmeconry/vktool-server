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
import { getManager, Brackets, SelectQueryBuilder } from 'typeorm';
import { AuthRoles } from '../interfaces/AuthRoles';

enum PaginationSortDirections {
	ASC = 'ASC',
	DESC = 'DESC',
}

export enum PaginationFilterOperator {
	'=' = '=',
	'>=' = '>=',
	'=>' = '=>',
	'<' = '<',
	'>' = '>',
}

registerEnumType(PaginatedResponse, {
	name: 'Sortdirections',
});

registerEnumType(AuthRoles, {
	name: 'Authroles',
});

registerEnumType(PaginationFilterOperator, {
	name: 'PaginationFilterOperator',
});

@ObjectType()
export class PaginationFilter {
	@Field((type) => Int)
	id: number;

	@Field()
	field: string;

	@Field()
	operator: PaginationFilterOperator;

	@Field((type) => String || Number || Boolean)
	value: string | number | boolean;

	@Field()
	displayName: string;
}

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

	@Field({ nullable: true })
	searchString?: string;

	@Field((type) => Int, { nullable: true })
	filter?: number;
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
	relations: string[] = [],
	searchFields: string[] = [],
	filters: PaginationFilter[] = []
) {
	@ObjectType(`PaginationResponse${suffix}`)
	class PaginationResponse extends PaginatedResponse(objectTypes) {}

	@Resolver({ isAbstract: true })
	abstract class BaseResolver {
		@Authorized(getAuthRoles)
		@Query((type) => PaginationResponse, { name: `getAll${suffix}s` })
		public async getAll(
			@Args() { cursor, limit, sortBy, sortDirection, searchString, filter }: PaginationArgs<T>
		): Promise<PaginationResponse> {
			const qb = this.getListQB({ cursor, limit, sortBy, sortDirection, searchString, filter });
			const count = await qb.getCount();

			qb.skip(cursor);
			if (limit) qb.take(limit);

			let nextCursor = cursor + (limit || 0);
			if (nextCursor > count) {
				nextCursor = count;
			}
			const items = await qb.getMany();
			return {
				total: count,
				cursor: nextCursor,
				hasMore: nextCursor !== count,
				items,
			};
		}

		@Authorized(getAuthRoles)
		@Query((type) => objectTypes, { name: `get${suffix}`, nullable: true })
		public async get(@Arg('id', (type) => Int) id: number): Promise<T | null> {
			return getManager().getRepository(objectTypes).findOne(id, { relations });
		}

		@Authorized(getAuthRoles)
		@Query((type) => [PaginationFilter], { name: `get${suffix}Filters`, nullable: true })
		public getFilters(): PaginationFilter[] {
			return filters;
		}

		protected getListQB<T>({
			cursor,
			limit,
			sortBy,
			sortDirection,
			searchString,
			filter,
		}: PaginationArgs<T>): SelectQueryBuilder<T> {
			const qb = getManager()
				.getRepository(objectTypes)
				.createQueryBuilder(objectTypes.prototype.constructor.name);
			for (const relation of relations) {
				if (relation.indexOf('.') > -1) {
					qb.leftJoinAndSelect(relation, relation.split('.').slice(-1)[0]);
				} else {
					qb.leftJoinAndSelect(`${objectTypes.prototype.constructor.name}.${relation}`, relation);
				}
			}

			if (searchString) {
				qb.where(
					new Brackets((sub) => {
						for (const searchField of searchFields) {
							if (searchFields.indexOf(searchField) === 0) {
								sub.where(`MATCH(${searchField}) AGAINST ("*${searchString}*" IN BOOLEAN MODE)`);
							} else {
								sub.orWhere(`MATCH(${searchField}) AGAINST ("*${searchString}*" IN BOOLEAN MODE)`);
							}
						}
					})
				);
			}

			if (filter !== undefined) {
				const realFilter = filters.find((f) => f.id === filter);
				if (realFilter) {
					if (searchString) {
						qb.andWhere(`${realFilter.field} ${realFilter.operator} :value`, {
							value: realFilter.value,
						});
					} else {
						qb.where(`${realFilter.field} ${realFilter.operator} :value`, {
							value: realFilter.value,
						});
					}
				}
			}

			if (sortBy) {
				if (sortBy.toString().indexOf('.') < 0 && relations.length > 0) {
					qb.orderBy(`${objectTypes.prototype.constructor.name}.${sortBy}`, sortDirection);
				} else if (sortBy.toString().indexOf('.') > 0) {
					qb.orderBy(sortBy.toString(), sortDirection);
				} else {
					qb.orderBy(`\`${sortBy}\``, sortDirection);
				}
			}
			return qb;
		}
	}

	return BaseResolver;
}

export async function resolveEntity<T>(
	entity: string,
	id: number,
	relations: string[] = []
): Promise<T> {
	const qb = getManager().getRepository<T>(entity).createQueryBuilder(entity);

	for (const relation of relations) {
		if (relation.indexOf('.') > -1) {
			qb.leftJoinAndSelect(relation, relation.split('.').slice(-1)[0]);
		} else {
			qb.leftJoinAndSelect(`${entity}.${relation}`, relation);
		}
	}

	const obj = await qb.where(`${entity}.id = :id`, { id }).getOne();
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
