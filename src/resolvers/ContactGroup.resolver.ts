import { createResolver } from './helpers'
import ContactGroup from '../entities/ContactGroup'
import { Resolver, Query, Authorized } from 'type-graphql'
import { getManager, In } from 'typeorm'
import { AuthRoles } from '../interfaces/AuthRoles'

const baseResolver = createResolver('ContactGroup', ContactGroup, [AuthRoles.AUTHENTICATED])

@Resolver((of) => ContactGroup)
export default class ContactGroupResolver extends baseResolver {
	@Authorized([AuthRoles.AUTHENTICATED])
	@Query((type) => [ContactGroup])
	public async getRanks(): Promise<ContactGroup[]> {
		return getManager()
			.getRepository(ContactGroup)
			.find({ bexioId: In([17, 13, 11, 12, 28, 29, 15, 27, 26, 10, 14, 33, 22]) })
	}
}
