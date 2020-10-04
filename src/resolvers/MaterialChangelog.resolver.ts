import { GraphQLError } from 'graphql';
import moment from 'moment';
import {
	Arg,
	Authorized,
	Ctx,
	Field,
	FieldResolver,
	InputType,
	Mutation,
	registerEnumType,
	Resolver,
	Root,
	createUnionType,
	Int,
} from 'type-graphql';
import { getManager } from 'typeorm';
import { ApolloContext } from '../controllers/CliController';
import Contact from '../entities/Contact';
import CustomCompensation from '../entities/CustomCompensation';
import MaterialChangelog from '../entities/MaterialChangelog';
import MaterialChangelogToProduct from '../entities/MaterialChangelogToProduct';
import Product from '../entities/Product';
import Warehouse from '../entities/Warehouse';
import { AuthRoles } from '../interfaces/AuthRoles';
import AuthService from '../services/AuthService';
import { createResolver, resolveEntity, resolveEntityArray } from './helpers';
import { AddMaterialChangelogToProduct } from './MaterialChangelogToProduct.resolver';
import User from '../entities/User';
import File from '../entities/File';
import MaterialChangelogService from '../services/MaterialChangelogService';

const baseResolver = createResolver(
	'MaterialChangelog',
	MaterialChangelog,
	[
		AuthRoles.MATERIAL_CHANGELOG_CREATE,
		AuthRoles.MATERIAL_CHANGELOG_EDIT,
		AuthRoles.MATERIAL_CHANGELOG_READ,
	],
	[]
);

enum InOutType {
	CONTACT = 'CONTACT',
	WAREHOUSE = 'WAREHOUSE',
}

const ContactWarehouseUnion = createUnionType({
	name: 'ContactWarehouse', // the name of the GraphQL union
	types: () => [Contact, Warehouse] as const, // function that returns tuple of object types classes,
	resolveType: (value) => {
		if ('firstname' in value) {
			return Contact;
		}

		if ('name' in value) {
			return Warehouse;
		}
	},
});

registerEnumType(InOutType, { name: 'MaterialChangelogInOutType' });

@InputType()
class AddMaterialChangelog {
	@Field((type) => [AddMaterialChangelogToProduct])
	public products: AddMaterialChangelogToProduct[];

	@Field({ nullable: true })
	public in: number;

	@Field((type) => InOutType)
	public inType: InOutType;

	@Field({ nullable: true })
	public out: number;

	@Field((type) => InOutType)
	public outType: InOutType;

	@Field()
	public date: Date;

	@Field((type) => [File])
	public files: File[];

	@Field({ nullable: true })
	public signature: string;
}

@Resolver((of) => MaterialChangelog)
export default class MaterialChangelogResolver extends baseResolver {
	@Authorized([AuthRoles.MATERIAL_CHANGELOG_EDIT])
	@Mutation((type) => MaterialChangelog)
	public async deleteMaterialChangelog(
		@Arg('id', (type) => Int) id: number,
		@Ctx() ctx: ApolloContext
	): Promise<MaterialChangelog> {
		const mc = await resolveEntity<MaterialChangelog>('MaterialChangelog', id, [
			'changes',
			'outContact',
		]);
		mc.deletedBy = ctx.user;
		await mc.save();
		await getManager().getRepository(MaterialChangelog).softDelete(mc.id);

		const compensations = mc.changes
			.map((c) => c.compensationId)
			.filter((id) => id !== undefined) as number[];
		const compensationRepo = getManager().getRepository(CustomCompensation);
		let refund = 0;
		const deletetionPromises = compensations.map(async (c) => {
			const comp = await resolveEntity<CustomCompensation>('CustomCompensation', c);
			comp.deletedBy = ctx.user;
			await comp.save();
			await compensationRepo.softDelete(comp.id);

			if (comp.paied) {
				refund = refund + comp.amount;
			}
		});
		if (refund > 0 && mc.outContact) {
			const comp = new CustomCompensation(
				mc.outContact,
				ctx.user,
				refund,
				new Date(),
				`Gutschrift Materialfassung (${moment(mc.date).format('DD.MM.YYYY')})`,
				AuthService.isAuthorized(ctx.user.roles, AuthRoles.COMPENSATIONS_APPROVE)
			);
		}

		await Promise.all(deletetionPromises);
		return mc;
	}

	@Authorized([AuthRoles.MATERIAL_CHANGELOG_CREATE])
	@Mutation((type) => MaterialChangelog)
	public async addMaterialChangelog(
		@Arg('data') data: AddMaterialChangelog,
		@Ctx() ctx: ApolloContext
	): Promise<MaterialChangelog> {
		const mc = new MaterialChangelog();
		mc.createdAt = new Date();
		mc.creator = ctx.user;
		mc.date = new Date(data.date);
		const inEntity = await this.resolveInOut(data.in, data.inType);

		if (inEntity instanceof Contact) {
			mc.inContact = inEntity;
		} else {
			mc.inWarehouse = inEntity;
		}

		const outEntity = await this.resolveInOut(data.out, data.outType);
		if (outEntity instanceof Contact) {
			mc.outContact = outEntity;
		} else {
			mc.outWarehouse = outEntity;
		}
		mc.files = data.files;
		mc.signature = data.signature;

		await mc.save();

		let total = 0;
		const products = [];
		for (const product of data.products) {
			const pe = await resolveEntity<Product>('Product', product.productId);
			const p = new MaterialChangelogToProduct();
			p.changelog = mc;
			p.product = pe;
			p.amount = product.amount;
			p.charge = product.charge;
			p.number = product.number;

			if (p.charge) {
				total = total + (pe.salePrice || 0) * p.amount;
			}

			products.push(p.save());
		}
		const savedProducts = await Promise.all(products);

		let cc: CustomCompensation | undefined = undefined;
		if (total > 0) {
			if (mc.outContact) {
				let cc = new CustomCompensation(
					mc.outContact,
					ctx.user,
					total * -1,
					mc.date,
					`Materialfassung`,
					AuthService.isAuthorized(ctx.user.roles, AuthRoles.COMPENSATIONS_APPROVE)
				);
				cc = await cc.save();
				for (const sp of savedProducts) {
					if (sp.charge) {
						sp.compensation = cc;
					}
					await sp.save();
				}
			} else {
				throw new GraphQLError('Cannot charge without out contact');
			}
		}

		return mc.save();
	}

	@Authorized([AuthRoles.MATERIAL_CHANGELOG_READ])
	@Mutation((type) => Boolean)
	public async sendReceiptMail(@Arg('id', (type) => Int) id: number): Promise<boolean> {
		const changelog = await resolveEntity<MaterialChangelog>('MaterialChangelog', id, [
			'changes',
			'changes.product',
			'inContact',
			'outContact',
			'inWarehouse',
			'outWarehouse',
		]);
		return MaterialChangelogService.sendReceiptMail(changelog);
	}

	@FieldResolver((type) => [MaterialChangelogToProduct])
	public async changes(@Root() object: MaterialChangelog): Promise<MaterialChangelogToProduct[]> {
		if (!object.changeIds) return [];
		return resolveEntityArray('MaterialChangelogToProduct', object.changeIds);
	}

	@FieldResolver((type) => Contact, { nullable: true })
	public async inContact(@Root() object: MaterialChangelog): Promise<Contact | null> {
		if (!object.inContactId) return null;
		return resolveEntity('Contact', object.inContactId);
	}

	@FieldResolver((type) => Contact, { nullable: true })
	public async outContact(@Root() object: MaterialChangelog): Promise<Contact | null> {
		if (!object.outContactId) return null;
		return resolveEntity('Contact', object.outContactId);
	}

	@FieldResolver((type) => Warehouse, { nullable: true })
	public async inWarehouse(@Root() object: MaterialChangelog): Promise<Warehouse | null> {
		if (!object.inWarehouseId) return null;
		return resolveEntity('Warehouse', object.inWarehouseId);
	}

	@FieldResolver((type) => Warehouse, { nullable: true })
	public async outWarehouse(@Root() object: MaterialChangelog): Promise<Warehouse | null> {
		if (!object.outWarehouseId) return null;
		return resolveEntity('Warehouse', object.outWarehouseId);
	}

	@FieldResolver((type) => ContactWarehouseUnion)
	public async in(@Root() obj: MaterialChangelog): Promise<Contact | Warehouse> {
		try {
			return await resolveEntity<Warehouse>('Warehouse', obj.inWarehouseId || -1);
		} catch (e) {
			return await resolveEntity<Contact>('Contact', obj.inContactId || -1);
		}
	}

	@FieldResolver((type) => ContactWarehouseUnion)
	public async out(@Root() obj: MaterialChangelog): Promise<Contact | Warehouse> {
		try {
			return await resolveEntity<Warehouse>('Warehouse', obj.outWarehouseId || -1);
		} catch (e) {
			return await resolveEntity<Contact>('Contact', obj.outContactId || -1);
		}
	}

	@FieldResolver((type) => User)
	public async creator(@Root() obj: MaterialChangelog): Promise<User> {
		return resolveEntity('User', obj.creatorId);
	}

	@FieldResolver((type) => User, { nullable: true })
	public async updatedBy(@Root() obj: MaterialChangelog): Promise<User | null> {
		if (!obj.updatedById) return null;
		return resolveEntity('User', obj.updatedById);
	}

	private async resolveInOut(id: number, type: InOutType): Promise<Contact | Warehouse> {
		switch (type) {
			case InOutType.CONTACT:
				return resolveEntity<Contact>('Contact', id);
			case InOutType.WAREHOUSE:
				return resolveEntity<Warehouse>('Warehouse', id);
		}
	}
}
