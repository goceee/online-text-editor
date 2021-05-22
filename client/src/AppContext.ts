import { createContext } from 'react';
import IAppContext from './interfaces/IAppContext';

const AppContext = createContext<IAppContext>({
  documents: [],
  userID: '',
  alertSettings: {
    showAlert: false,
    alertMessage: '',
    severityType: 'success',
  },
  setDocuments: () => {},
  setUserID: () => {},
  setAlertSettings: () => {},
});

export default AppContext;
