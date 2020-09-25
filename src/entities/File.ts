import { ObjectType, Field } from 'type-graphql';
import Base from './Base';

export interface IFile {
    name: string;
	filename: string;
	mimetype: string;
	encoding: string;
}

@ObjectType()
export default class File implements IFile {
	@Field()
	public name: string;

	@Field()
	public filename: string;

	@Field()
	public mimetype: string;

	@Field()
	public encoding: string;
}
