import Contact from '../entities/Contact';
import { getManager } from 'typeorm';

export default class ContactService {
	public static async getActiveMembers(readPermission = false): Promise<Contact[]> {
		let contacts: Contact[];
		if (readPermission) {
			contacts = await getManager().getRepository(Contact).find();
		} else {
			contacts = await getManager()
				.getRepository(Contact)
				.createQueryBuilder('contact')
				.select([
					'contact.id',
					'contact.firstname',
					'contact.lastname',
					'contact.address',
					'contact.postcode',
					'contact.city',
					'contact.mail',
				])
				.leftJoinAndSelect('contact.contactGroups', 'contactGroups')
				.getMany();
		}

		return contacts.filter((contact) =>
			(contact.contactGroups || []).find((group) => group.bexioId === 7)
		);
	}
}
