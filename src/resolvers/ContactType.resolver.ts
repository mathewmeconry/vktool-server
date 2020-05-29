import { createResolver } from './helpers'
import ContactType from '../entities/ContactType'
import { Resolver } from 'type-graphql'
import { AuthRoles } from '../interfaces/AuthRoles'

const baseResolver = createResolver('ContactType', ContactType, [AuthRoles.AUTHENTICATED])

@Resolver((of) => ContactType)
export default class ContactTypeResolver extends baseResolver { }
