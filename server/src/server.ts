import mongoose from 'mongoose';
// eslint-disable-next-line
import { DeltaStatic } from 'quill';
import { Server, Socket } from 'socket.io';
import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import config from './helpers/config';
import Document from './models/Document';
import User from './models/User';
import IUserModel from './interfaces/IUser';
import IDocument from './interfaces/IDocument';
import { createDocument, findDocument, randomNumber } from './helpers/utils';
import requestLogger from './helpers/request.logger';
import userRoute from './routes/userRoute';
import documentRoute from './routes/documentRoute';
import { IDocumentObject } from './interfaces/IDocumentObject';
import { ISaveDocument } from './interfaces/ISaveDocument';

mongoose.connect(config.database_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const app: Application = express();
/* Middleware */
app.use(cors());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(requestLogger);

/* Routes */
app.use('/', userRoute);
app.use('/', documentRoute);

app.use((err: Error, req: Request, res: Response) =>
  res.status(500).json({
    message: err.message,
  })
);

const server = app.listen(config.port, () => {
  console.log(`Server started on port: ${config.port}`);
});

const io: Server = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket: Socket) => {
  socket.on('get-document', async (documentId) => {
    try {
      const initialDocument: IDocument | null = await findDocument(documentId);

      socket.join(documentId);
      if (initialDocument)
        socket.emit('load-document', {
          title: initialDocument.title,
          data: initialDocument.data,
        });
      else
        socket.emit('load-document', {
          title: '',
          data: '',
        });

      socket.on('send-changes', (delta: DeltaStatic) => {
        socket.broadcast.to(documentId).emit('receive-changes', delta);
      });

      socket.on('set-document-title', async ({ documentTitle, userID }) => {
        Document.findById(documentId)
          .then((document: IDocument | null) => {
            if (document) {
              if (documentTitle !== '') {
                document.title = documentTitle;
              }
              document.save();
            }
          })
          .catch((error) => {
            console.log(error);
          });
        const userData: IUserModel | null = await User.findById(userID);
        if (userData) {
          const { documents }: { documents: IDocumentObject[] } = userData;
          const documentIndex = documents.findIndex(
            (document) => document.id === documentId
          );
          if (documentIndex >= 0)
            documents[documentIndex].title = documentTitle;
          await User.findByIdAndUpdate(userID, { documents });
        }
      });

      socket.on(
        'save-document',
        async ({ data, documentTitle = '', userID }: ISaveDocument) => {
          const untitled = `Untitled-${randomNumber(10, 100000)}`;
          Document.findById(documentId)
            .then(async (document: IDocument | null) => {
              if (document) {
                if (!document.title) {
                  if (documentTitle === '') {
                    document.title = untitled;
                    socket.emit('add-untitled', untitled);
                  } else {
                    document.title = documentTitle;
                  }
                }
                document.data = data;
                document.save();
              } else if (documentTitle === '') {
                await createDocument(documentId, userID, untitled, data);
                socket.emit('add-untitled', untitled);
              } else
                await createDocument(documentId, userID, documentTitle, data);
            })
            .catch((error) => {
              console.log(error);
            });
          const userData: IUserModel | null = await User.findById(userID);

          if (userData) {
            const { documents }: { documents: IDocumentObject[] } = userData;
            const documentIndex = documents.findIndex(
              (document) => document.id === documentId
            );

            if (documentIndex >= 0)
              if (documentTitle === '') {
                if (!documents[documentIndex].title)
                  documents[documentIndex].title = untitled;
              } else documents[documentIndex].title = documentTitle;
            else if (documentTitle === '') {
              documents.push({
                id: documentId,
                title: untitled,
              });
            } else {
              documents.push({
                id: documentId,
                title: documentTitle,
              });
            }
            await User.findByIdAndUpdate(userID, { documents });
          }
        }
      );
    } catch (e) {
      socket.emit('id-error', e);
    }
  });
});
