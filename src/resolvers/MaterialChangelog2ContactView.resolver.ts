import { Arg, Authorized, FieldResolver, ID, Query, Resolver, Root } from 'type-graphql';
import { getManager } from 'typeorm';
import Contact from '../entities/Contact';
import { MaterialChangelog2ContactView } from '../entities/MaterialChangelog2ContactView';
import Product from '../entities/Product';
import { AuthRoles } from '../interfaces/AuthRoles';

@Resolver((of) => MaterialChangelog2ContactView)
export default class MaterialChangelog2ContactViewResolver {
	@Authorized([AuthRoles.CONTACTS_READ, AuthRoles.MEMBERS_READ])
	@Query((returns) => [MaterialChangelog2ContactView], { nullable: true })
	public async getContactStock(
		@Arg('contactId', () => ID) contactId: number
	): Promise<MaterialChangelog2ContactView[]> {
		return await getManager().getRepository(MaterialChangelog2ContactView).find({
			where: { contactId },
		});
	}

	@FieldResolver((type) => Product)
	async product(@Root() materialChangelog2ContactView: MaterialChangelog2ContactView) {
		return await getManager()
			.getRepository(Product)
			.findOne({
				where: { id: materialChangelog2ContactView.productId },
			});
	}


	@FieldResolver((type) => Contact)
	async contact(@Root() materialChangelog2ContactView: MaterialChangelog2ContactView) {
		return await getManager()
			.getRepository(Contact)
			.findOne({
				where: { id: materialChangelog2ContactView.contactId },
			});
	}
}
