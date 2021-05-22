import { Schema, model } from 'mongoose';
import IDocument from '../interfaces/IDocument';

const Document: Schema = new Schema({
  _id: String,
  title: String,
  data: Object,
  shareable: { type: Boolean, default: false },
  creator: String,
  collaborators: [String],
});

export default model<IDocument>('Document', Document);
