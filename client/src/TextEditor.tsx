import {
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import Quill, { DeltaStatic, Sources } from 'quill';
import 'quill/dist/quill.snow.css';
import { io, Socket } from 'socket.io-client';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import LinkIcon from '@material-ui/icons/Link';
import PrintIcon from '@material-ui/icons/Print';
import Timer from './Timer';
import CustomDialog from './CustomDialog';
import { randomNumber } from './utils';
import IServerResponse from './interfaces/IServerResponse';
import IHistoryState from './interfaces/IHistoryState';
import AlertMessage from './AlertMessage';
import AppContext from './AppContext';
import IParams from './interfaces/IParams';

const SAVE_INTERVAL_MS: number = 10000;

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['bold', 'italic', 'underline'],
  [{ color: [] }, { background: [] }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ align: [] }],
  ['image', 'blockquote', 'code-block'],
  ['clean'],
];

const shareable = async (
  documentId: string,
  enable: boolean
): Promise<IServerResponse> => {
  const response: Response = await fetch('/shareable', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ documentId, enable }),
  });
  const data: IServerResponse = await response.json();
  return data;
};

const TextEditor: React.FC = () => {
  const { id: documentId } = useParams<IParams>();
  const [socket, setSocket] = useState<Socket>();
  const [quill, setQuill] = useState<Quill>();
  const [saveTitle, setSaveTitle] = useState<boolean>(true);
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const [counter, setCounter] = useState<Timer>();
  const firstTime = useRef<boolean>(true);
  const { state } = useLocation<IHistoryState>();
  const history = useHistory();
  const matches = useMediaQuery('(max-width:520px)');
  const [open, setOpen] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const documentUrl = useRef<HTMLInputElement>(null);
  const { documents, userID, alertSettings, setDocuments, setAlertSettings } =
    useContext(AppContext);
  const isShareable = useRef<boolean>(
    documents.some((document) => document.id === documentId)
  );
  const saveClicked = useRef<boolean>(false);
  const documentTitleRef = useRef<string>('');

  const changeTitle = (element: RefObject<HTMLInputElement>) => {
    if (element.current?.value !== undefined) {
      if (element.current.value !== '') {
        const documentIndex = documents.findIndex(
          (obj) => obj.title === documentTitle
        );
        if (documentIndex >= 0) {
          documents[documentIndex].title = element.current.value;
          setDocuments(documents);
        } else {
          setDocuments([
            ...documents,
            { title: element.current.value, id: documentId },
          ]);
        }
        setDocumentTitle(element.current.value);
        setSaveTitle(true);
        documentTitleRef.current = element.current.value;
      }
    }
  };

  const backHome = () => {
    counter?.stop();
    setAlertSettings({ ...alertSettings, showAlert: false });
    history.push('/');
    socket?.disconnect();
  };

  const openDialog = async () => {
    await shareable(documentId, true);
    setOpen(true);
    setTimeout(() => {
      documentUrl.current?.select();
    }, 200);
  };

  const saveDocument = () => {
    saveClicked.current = true;
    let title: string;
    counter?.stop();
    if (socket == null || quill == null) return;
    const documentIndex = documents.findIndex((obj) => obj.id === documentId);
    if (documentTitle === '') {
      title = `Untitled-${randomNumber(10, 100000)}`;
      setDocumentTitle(title);
      setSaveTitle(true);

      if (documentIndex >= 0) {
        documents[documentIndex].title = title;
        setDocuments(documents);
      } else {
        setDocuments([...documents, { title, id: documentId }]);
      }
    } else {
      title = documentTitle;
      if (documentIndex >= 0) {
        documents[documentIndex].title = title;
      } else {
        setDocuments([...documents, { title, id: documentId }]);
      }
    }
    socket.emit('save-document', {
      data: quill.getContents(),
      documentTitle: title,
      userID,
    });
    isShareable.current = true;
    setAlertSettings({
      severityType: 'success',
      alertMessage: 'Document Saved',
      showAlert: true,
    });
  };

  useEffect(() => {
    const isUserAllowed = async () => {
      const response: Response = await fetch('/checkShareability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId }),
      });
      const data: IServerResponse = await response.json();

      if (data.success) {
        setAllowed(true);
      } else history.push('/');
    };
    if (state?.newDocument) setAllowed(true);
    else isUserAllowed();
  }, [documentId, history, state?.newDocument]);

  useEffect(() => {
    if (!saveClicked.current)
      if (documentTitle !== '') {
        if (socket == null) return;
        socket.emit('set-document-title', { documentTitle, userID });
      }
    saveClicked.current = false;
  }, [socket, documentTitle, userID]);

  useEffect(() => {
    if (socket == null || quill == null) return;
    socket.once('load-document', ({ title, data }) => {
      if (title) {
        setSaveTitle(true);
        setDocumentTitle(title);
      } else {
        setSaveTitle(false);
      }
      quill.setContents(data);
      quill.enable();
      firstTime.current = true;
    });

    socket.emit('get-document', documentId);
  }, [socket, quill, documentId]);

  useEffect(() => {
    if (socket == null || quill == null) return;
    const handler = (delta: DeltaStatic) => {
      quill.updateContents(delta);
    };
    socket.on('receive-changes', handler);

    return () => {
      socket.off('receive-changes', handler);
      socket.disconnect();
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;
    const handler = (
      delta: DeltaStatic,
      oldDelta: DeltaStatic,
      source: Sources
    ) => {
      if (source !== 'user') return;

      socket.emit('send-changes', delta);
    };

    quill.on('text-change', (delta, oldDelta, source) => {
      if (firstTime.current) {
        firstTime.current = false;
      } else {
        counter?.start();
      }
      handler(delta, oldDelta, source);
    });

    return () => {
      counter?.stop();
      quill.off('text-change', handler);
    };
  }, [counter, socket, quill]);

  useEffect(() => {
    if (socket == null) return;
    socket.on('add-untitled', (untitled) => {
      setDocumentTitle(untitled);
      setSaveTitle(true);
      setDocuments((prevState) => [
        ...prevState,
        { title: untitled, id: documentId },
      ]);
    });
  }, [socket, setDocuments, documentId]);

  const wrapperRef = useCallback(
    (wrapper) => {
      if (wrapper == null) return;
      wrapper.innerHTML = '';
      const editor: HTMLDivElement = document.createElement('div');
      wrapper.append(editor);
      const s: Socket = io('http://localhost:3001');
      const q: Quill = new Quill(editor, {
        theme: 'snow',
        modules: { toolbar: TOOLBAR_OPTIONS },
      });
      q.disable();
      setQuill(q);
      setSocket(s);
      setCounter(
        new Timer(() => {
          if (s == null || q == null) return;
          s.emit('save-document', {
            data: q.getContents(),
            userID,
            documentTitle: documentTitleRef.current,
          });
          isShareable.current = true;
          setAlertSettings({
            severityType: 'success',
            alertMessage: 'Autosaving',
            showAlert: true,
          });
        }, SAVE_INTERVAL_MS)
      );
    },
    [setAlertSettings, userID]
  );

  return allowed ? (
    <>
      <Box
        className='titleBar'
        display='flex'
        justifyContent='center'
        alignItems='center'
        height='50px'
        px='8px'
      >
        <Box
          display='flex'
          width='838px'
          justifyContent='space-between'
          alignItems='center'
          paddingRight='8px'
        >
          <Box>
            <Button color='secondary' size='large' onClick={backHome}>
              Back
            </Button>
            <Button color='primary' size='large' onClick={saveDocument}>
              Save
            </Button>
          </Box>
          {saveTitle ? (
            <Box
              display='flex'
              flexDirection='row'
              alignItems='center'
              onMouseEnter={() => {
                setShowEdit(true);
              }}
              onMouseLeave={() => {
                setShowEdit(false);
              }}
            >
              <Tooltip title='Double click to edit'>
                <Typography
                  style={{
                    textAlign: 'center',
                    color: 'gray',
                    userSelect: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: matches ? '' : '1.25rem',
                  }}
                  onDoubleClick={() => {
                    setSaveTitle(false);
                  }}
                >
                  {documentTitle}
                </Typography>
              </Tooltip>
              {showEdit ? (
                <EditIcon
                  style={{
                    marginLeft: '5px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                  }}
                  onClick={() => setSaveTitle(false)}
                />
              ) : null}
            </Box>
          ) : (
            <TextField
              style={{ width: '65%' }}
              variant='outlined'
              placeholder='Enter title'
              inputRef={titleRef}
              size='small'
              color='primary'
              defaultValue={documentTitle}
              inputProps={{ maxLength: 60, style: { textAlign: 'center' } }}
              onBlur={() => changeTitle(titleRef)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  changeTitle(titleRef);
                }
              }}
            />
          )}
          <Box>
            <Tooltip title='Print this document'>
              <IconButton size='small' onClick={() => window.print()}>
                <PrintIcon
                  color='primary'
                  style={{ fontSize: '1.8rem', cursor: 'pointer' }}
                />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={
                isShareable.current
                  ? 'Make this document shareable'
                  : 'Save the document to enable shareability'
              }
            >
              <span>
                <IconButton
                  disabled={!isShareable.current}
                  size='small'
                  onClick={openDialog}
                >
                  <LinkIcon
                    color={isShareable.current ? 'primary' : 'disabled'}
                    style={{ fontSize: '1.8rem', cursor: 'pointer' }}
                  />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      <CustomDialog
        open={open}
        setOpen={setOpen}
        documentUrl={documentUrl}
        documentId={documentId}
        shareability={shareable}
      />
      <AlertMessage
        alertSettings={alertSettings}
        setAlertSettings={setAlertSettings}
      />
      <div className='container' ref={wrapperRef}></div>
    </>
  ) : null;
};

export default TextEditor;
