import { Field, ObjectType, InputType } from 'type-graphql';

export interface IFile {
    name: string;
	filename: string;
	mimetype: string;
	encoding: string;
}

@ObjectType()
@InputType('FileInput')
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
