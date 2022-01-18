import {
	Arg,
	Authorized,
	Field,
	FieldResolver,
	InputType,
	Mutation,
	Query,
	Resolver,
	Root,
} from 'type-graphql';
import { getManager } from 'typeorm';
import Contact from '../entities/Contact';
import MaterialChangelog from '../entities/MaterialChangelog';
import Product from '../entities/Product';
import { AuthRoles } from '../interfaces/AuthRoles';
import MaterialChangelogService, { StockEntry } from '../services/MaterialChangelogService';
import { createResolver, resolveEntity } from './helpers';

const baseResolver = createResolver(
	'Product',
	Product,
	[AuthRoles.PRODUCT_READ],
	['contact'],
	['internName', 'contact.firstname', 'contact.lastname']
);

@InputType()
class EditProduct {
	@Field()
	public id: number;

	@Field()
	public weight: number;
}

@Resolver((of) => Product)
export default class ProductResolver extends baseResolver {
	@Authorized([AuthRoles.PRODUCT_EDIT])
	@Mutation((type) => Product)
	public async editProduct(@Arg('data') data: EditProduct): Promise<Product> {
		const product = await getManager().getRepository(Product).findOne(data.id);
		if (product) {
			product.weight = data.weight;
			return product.save();
		}

		return Promise.reject(`Couldn't find product with id ${data.id}`);
	}

	@Authorized([
		AuthRoles.PRODUCT_READ,
		AuthRoles.MATERIAL_CHANGELOG_CREATE,
		AuthRoles.MATERIAL_CHANGELOG_EDIT,
	])
	@Query((type) => [Product])
	public async getProductsAll(): Promise<Product[]> {
		const qb = getManager()
			.getRepository(Product)
			.createQueryBuilder('product')
			.orderBy('product.internName', 'ASC');

		return qb.getMany();
	}

	@FieldResolver((type) => Contact, { nullable: true })
	public async contact(@Root() object: Product): Promise<Contact | null> {
		if (!object.contactId) return null;
		return resolveEntity('Contact', object.contactId);
	}

	@FieldResolver((type) => [StockEntry])
	public async locations(@Root() object: Product): Promise<StockEntry[]> {
		return MaterialChangelogService.getProductLocation(object.id);
	}

	@FieldResolver((type) => [MaterialChangelog])
	public async changelogs(@Root() object: Product): Promise<MaterialChangelog[]> {
		return MaterialChangelogService.getProductChangelogs(object.id);
	}
}
