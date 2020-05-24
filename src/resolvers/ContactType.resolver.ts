import { createResolver } from './helpers';
import ContactType from '../entities/ContactType';
import { Resolver } from 'type-graphql';

const baseResolver = createResolver('ContactType', ContactType);

@Resolver((of) => ContactType)
export default class ContactTypeResolver extends baseResolver {}
