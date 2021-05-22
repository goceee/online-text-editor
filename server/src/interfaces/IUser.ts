import { Document } from 'mongoose';
import { IDocumentObject } from './IDocumentObject';

interface IUser extends Document {
  fullname: string;
  email: string;
  password: string;
  documents: IDocumentObject[];
}

export default interface IUserModel extends IUser, Document {
  // eslint-disable-next-line no-unused-vars
  checkPassword(password: string): Promise<boolean>;
}
