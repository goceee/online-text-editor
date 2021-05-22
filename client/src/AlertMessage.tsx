import { memo } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { Dispatch, SetStateAction } from 'react';
import IAlert from './interfaces/IAlert';

interface Props {
  alertSettings: IAlert;
  setAlertSettings: Dispatch<SetStateAction<IAlert>>;
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant='filled' {...props} />;
}

const AlertMessage = memo(
  ({ alertSettings, setAlertSettings }: Props) => {
    const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }
      setAlertSettings({ ...alertSettings, showAlert: false });
    };
    return (
      <Snackbar
        open={alertSettings.showAlert}
        autoHideDuration={2000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity={alertSettings.severityType}>
          {alertSettings.alertMessage}
        </Alert>
      </Snackbar>
    );
  },
  (prevProps, nextProps) =>
    prevProps.alertSettings.alertMessage ===
      nextProps.alertSettings.alertMessage &&
    prevProps.alertSettings.showAlert === nextProps.alertSettings.showAlert
);

export default AlertMessage;
