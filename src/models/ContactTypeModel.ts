import { Document } from 'mongoose';

export default interface ContactTypeModel extends Document {
    bexioId: number,
    name: string
}