import { useContext, useState } from 'react';
import { Box, Button, withStyles } from '@material-ui/core';
import { useHistory } from 'react-router';
import { v4 as uuidV4 } from 'uuid';
import AlertMessage from './AlertMessage';
import AppContext from './AppContext';
import LoadDocuments from './LoadDocuments';
import IHistoryState from './interfaces/IHistoryState';

const StyledButton = withStyles({
  root: {
    '&:hover': {
      backgroundColor: '#009688',
      color: '#fff',
    },
  },
})(Button);

const UserPage = () => {
  const history = useHistory<IHistoryState>();
  const [showSavedDocuments, setShowSavedDocuments] = useState<boolean>(false);
  const { alertSettings, setAlertSettings } = useContext(AppContext);

  const loadEditor = async () => {
    try {
      const documentId = uuidV4();
      history.push(`/document/${documentId}`, { newDocument: true });
    } catch (e) {
      setAlertSettings({
        severityType: 'error',
        alertMessage: e.message,
        showAlert: true,
      });
    }
  };

  return showSavedDocuments ? (
    <LoadDocuments setShowSavedDocuments={setShowSavedDocuments} />
  ) : (
    <Box
      justifyContent='center'
      alignItems='center'
      display='flex'
      height='100vh'
    >
      <Box
        display='flex'
        flexDirection='column'
        justifyContent='space-between'
        width='300px'
        height='100px'
      >
        <StyledButton
          color='primary'
          variant='outlined'
          fullWidth
          size='large'
          onClick={loadEditor}
        >
          New
        </StyledButton>
        <StyledButton
          color='primary'
          variant='outlined'
          fullWidth
          size='large'
          onClick={() => setShowSavedDocuments(true)}
        >
          Load
        </StyledButton>
      </Box>
      <AlertMessage
        alertSettings={alertSettings}
        setAlertSettings={setAlertSettings}
      />
    </Box>
  );
};

export default UserPage;
