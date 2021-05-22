import { Document } from 'mongoose';

export default interface IDocument extends Document {
  _id: string;
  title: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  data: object;
  shareable: boolean;
  creator: string;
  collaborators: string[];
}
