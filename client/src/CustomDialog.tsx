import {
  Dispatch,
  SetStateAction,
  RefObject,
  ReactNode,
  useContext,
} from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import {
  InputAdornment,
  TextField,
  Dialog,
  IconButton,
  Typography,
  Button,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import { FileCopyOutlined } from '@material-ui/icons';
import IServerResponse from './interfaces/IServerResponse';
import AlertMessage from './AlertMessage';
import AppContext from './AppContext';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  documentUrl: RefObject<HTMLInputElement>;
  documentId: string;
  shareability: (
    documentId: string,
    enable: boolean
  ) => Promise<IServerResponse>;
}

export interface DialogTitleProps extends WithStyles<typeof styles> {
  id: string;
  children: ReactNode;
  onClose: () => void;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant='h6'>{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label='close'
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const CustomDialog = ({
  open,
  setOpen,
  documentUrl,
  documentId,
  shareability,
}: Props) => {
  const { alertSettings, setAlertSettings } = useContext(AppContext);

  const handleClose = () => {
    setOpen(false);
  };

  const copyToClipboard = () => {
    documentUrl.current?.select();
    document.execCommand('copy');
  };

  return (
    <div>
      <Dialog
        onClose={handleClose}
        aria-labelledby='customized-dialog-title'
        open={open}
      >
        <DialogTitle id='customized-dialog-title' onClose={handleClose}>
          Sharing enabled
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Please send the following link to your friends to collaborate.
          </Typography>
          <TextField
            variant='outlined'
            fullWidth
            inputRef={documentUrl}
            value={window.location.href}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton size='small' onClick={copyToClipboard}>
                    <FileCopyOutlined />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            color='secondary'
            style={{ float: 'right' }}
            onClick={async () => {
              try {
                await shareability(documentId, false);
                handleClose();
              } catch (e) {
                setAlertSettings({
                  severityType: 'error',
                  alertMessage: e.message,
                  showAlert: true,
                });
              }
            }}
          >
            Turn off sharing
          </Button>
        </DialogContent>
      </Dialog>
      <AlertMessage
        alertSettings={alertSettings}
        setAlertSettings={setAlertSettings}
      />
    </div>
  );
};

export default CustomDialog;
