import { Dispatch, SetStateAction } from 'react';
import IAlert from './IAlert';
import IDocument from './IDocument';

export default interface IAppContext {
  documents: IDocument[];
  userID: string;
  alertSettings: IAlert;
  // showAlert: boolean;
  // alertMessage: string;
  // severityType: Color;
  setDocuments: Dispatch<SetStateAction<IDocument[]>>;
  setUserID: Dispatch<SetStateAction<string>>;
  setAlertSettings: Dispatch<SetStateAction<IAlert>>;
  // setShowAlert: Dispatch<SetStateAction<boolean>>;
  // setAlertMessage: Dispatch<SetStateAction<string>>;
  // setSeverityType: Dispatch<SetStateAction<Color>>;
}
