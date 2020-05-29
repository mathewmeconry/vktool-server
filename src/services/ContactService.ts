import Contact from '../entities/Contact';
import { getManager } from 'typeorm';
import ContactExtension from '../entities/ContactExtension';

export default class ContactService {
	public static async getActiveMembers(readPermission = false): Promise<Contact[]> {
		const memberIds = await getManager()
			.getRepository(Contact)
			.createQueryBuilder('contact')
			.select('contact.id')
			.leftJoin('contact.contactGroups', 'contactGroups')
			.where('contactGroups.bexioId = :id', { id: 7 })
			.getRawMany();

		const qb = getManager()
			.getRepository(Contact)
			.createQueryBuilder('contact')
			.leftJoinAndSelect('contact.contactGroups', 'contactGroups')
			.leftJoinAndSelect('contact.extension', 'extension')
			.leftJoinAndSelect('extension.collectionPoint', 'collectionPoint')
			.where('contact.id IN (:ids)', { ids: memberIds.map(c => c['contact_id']) })
			.orderBy('contact.lastname')
			.addOrderBy('contact.firstname');
		const contacts = await qb.getMany();

		await Promise.all(
			contacts.map(async (c) => {
				await Promise.all([c.setFunctions(), c.setRank()]);
			})
		);

		return contacts;
	}
}
