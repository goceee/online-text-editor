// eslint-disable-next-line import/no-unresolved
import { DeltaStatic } from 'quill';
import IDocument from '../interfaces/IDocument';
import Document from '../models/Document';

const findDocument = async (id: string): Promise<IDocument | null> =>
  // if (id == null) throw new Error('No document id found');
  Document.findById(id);

const createDocument = async (
  id: string,
  user: string,
  title: string,
  data: DeltaStatic | string
): Promise<IDocument> =>
  Document.create({
    _id: id,
    data,
    creator: user,
    title,
  });

const randomNumber = (min: number, max: number): number =>
  Math.round(Math.random() * (max - min) + min);

export { findDocument, createDocument, randomNumber };
