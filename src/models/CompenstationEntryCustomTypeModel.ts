import { Schema } from 'mongoose';
import CompensationEntryModel from './CompensationEntryModel';

export default interface CompensationEntryCustomTypeModel extends CompensationEntryModel {
    description: string,
    type: 'custom'
}