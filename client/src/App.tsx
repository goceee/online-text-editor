import { useEffect, useState } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import IDocument from './interfaces/IDocument';
import IServerResponseData from './interfaces/IServerResponseData';
import HomePage from './HomePage';
import TextEditor from './TextEditor';
import AuthenticationPage from './AuthenticationPage';
import AppContext from './AppContext';
import IAlert from './interfaces/IAlert';

function App() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [userID, setUserID] = useState<string>('');
  const [alertSettings, setAlertSettings] = useState<IAlert>({
    showAlert: false,
    alertMessage: '',
    severityType: 'success',
  });

  useEffect(() => {
    const getLoggedIn = async () => {
      try {
        const response: Response = await fetch('/checkLogin');
        const responseJSON: IServerResponseData = await response.json();
        if (responseJSON.success) {
          setLoggedIn(true);
          setDocuments(responseJSON.data.documents);
          setUserID(responseJSON.data.userId);
        } else {
          setLoggedIn(false);
        }
      } catch (e) {
        setLoggedIn(false);
      }
    };
    getLoggedIn();
  }, []);

  return (
    <AppContext.Provider
      value={{
        documents,
        userID,
        alertSettings,
        setDocuments,
        setUserID,
        setAlertSettings,
      }}
    >
      <Switch>
        <Route path='/document/:id'>
          {loggedIn === true ? (
            <TextEditor />
          ) : loggedIn === false ? (
            <AuthenticationPage setLoggedIn={setLoggedIn} />
          ) : null}
        </Route>
        <Route path='/' exact>
          <HomePage loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
        </Route>
        <Redirect from='*' to='/' />
      </Switch>
    </AppContext.Provider>
  );
}

export default App;
