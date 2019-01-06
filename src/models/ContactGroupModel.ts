import { Document } from 'mongoose';

export default interface ContactGroupModel extends Document {
    bexioId: number,
    name: string
}