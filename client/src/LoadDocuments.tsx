import { Box, Button, Typography } from '@material-ui/core';
import { Dispatch, SetStateAction, useContext } from 'react';
import { useHistory } from 'react-router';
import AppContext from './AppContext';

interface Props {
  setShowSavedDocuments: Dispatch<SetStateAction<boolean>>;
}

const LoadDocuments = ({ setShowSavedDocuments }: Props) => {
  const { documents } = useContext(AppContext);
  const history = useHistory();
  return (
    <Box
      display='flex'
      justifyContent='center'
      alignItems='center'
      height='100vh'
    >
      <Box
        width='85%'
        maxWidth='650px'
        display='flex'
        flexDirection='column'
        justifyContent='center'
        alignItems='center'
        border='1px solid black'
        borderRadius='5px'
        p='10px'
      >
        <Box width='100%' borderBottom='1px solid black' alignSelf='baseline'>
          <Typography>Saved Documents ({documents.length})</Typography>
        </Box>
        <Box overflow='overlay' maxHeight='500px'>
          {documents.map((document, key) => (
            <Button
              fullWidth
              key={key}
              onClick={() => {
                history.push(`/document/${document.id}`);
              }}
            >
              {document.title}
            </Button>
          ))}
        </Box>
        <Button color='secondary' onClick={() => setShowSavedDocuments(false)}>
          Back
        </Button>
      </Box>
    </Box>
  );
};

export default LoadDocuments;
