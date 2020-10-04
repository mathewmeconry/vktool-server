import { GraphQLError } from 'graphql';
import { Arg, Authorized, Mutation, Resolver } from 'type-graphql';
import File from '../entities/File';
import fs from 'fs';
import config from 'config';
import { v4 as uuidv4 } from 'uuid';
import { FileUpload } from 'graphql-upload';
import { AuthRoles } from '../interfaces/AuthRoles';
import { GraphQLUpload } from 'apollo-server-express';

@Resolver(() => File)
export default class FileResolver {
	private allowedMimetypes = ['image/png', 'image/jpeg'];

	@Authorized([
		AuthRoles.BILLINGREPORTS_CREATE,
		AuthRoles.BILLINGREPORTS_EDIT,
		AuthRoles.MATERIAL_CHANGELOG_CREATE,
		AuthRoles.MATERIAL_CHANGELOG_EDIT,
	])
	@Mutation((type) => File)
	public async uploadFile(
		@Arg('file', (type) => GraphQLUpload as any) file: FileUpload
	): Promise<File> {
		if (!this.allowedMimetypes.includes(file.mimetype)) {
			throw new GraphQLError(`Mimetype ${file.mimetype} is not allowed`);
		}

		return new Promise((resolve, reject) => {
			const filename = `${uuidv4()}.${file.filename.split('.').splice(-1)[0]}`;
			const writeStream = fs.createWriteStream(`${config.get('fileStorage')}/${filename}`);
			const stream = file.createReadStream();
			stream.pipe(writeStream).on('close', () => {
				const fileObj = new File();
				fileObj.mimetype = file.mimetype;
				fileObj.name = file.filename;
				fileObj.encoding = file.encoding;
				fileObj.filename = filename;
				writeStream.close();

				resolve(fileObj);
			});
		});
	}
}
