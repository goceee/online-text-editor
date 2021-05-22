import IDocument from './IDocument';
import IServerResponse from './IServerResponse';

interface MessageResponse {
  documents: IDocument[];
  userId: string;
}

export default interface IServerResponseData extends IServerResponse {
  data: MessageResponse;
}
