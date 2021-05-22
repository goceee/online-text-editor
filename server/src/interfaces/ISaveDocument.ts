import { DeltaStatic } from 'quill';

export interface ISaveDocument {
  data: DeltaStatic;
  documentTitle: string;
  userID: string;
}
