import { Router, Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import config from '../helpers/config';
import IDocument from '../interfaces/IDocument';
import IJWTData from '../interfaces/IJWTData';
import IUserModel from '../interfaces/IUser';
import Document from '../models/Document';
import User from '../models/User';

const router = Router();

router.post(
  '/shareable',
  async (req: Request, res: Response): Promise<void> => {
    const user = <IJWTData>JWT.verify(req.cookies.access, config.secret);
    const document: IDocument | null = await Document.findById(
      req.body.documentId
    );
    if (document)
      if (document.creator === user.id) {
        await Document.findByIdAndUpdate(req.body.documentId, {
          shareable: req.body.enable,
        });
        res.send({ success: true, message: 'Shareability changed' });
        return;
      }
    res.status(405).send({ success: false, message: 'Not allowed' });
  }
);

router.post(
  '/checkShareability',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = <IJWTData>JWT.verify(req.cookies.access, config.secret);
      const document: IDocument | null = await Document.findById(
        req.body.documentId
      );
      if (
        user.id === document?.creator ||
        document?.collaborators.includes(user.id)
      ) {
        res.send({ success: true, message: user.id });
        return;
      }

      if (document?.shareable) {
        await Document.findByIdAndUpdate(req.body.documentId, {
          $addToSet: { collaborators: user.id },
        });
        await User.findById(user.id)
          .then((data: IUserModel | null) => {
            data?.documents.push({
              id: req.body.documentId,
              title: document.title,
            });
            data?.save();
          })
          .catch((e) => {
            console.log(e);
          });
        res.send({ success: true, message: 'OK' });
        return;
      }
      res.send({ success: false, message: 'Document not shareable/found' });
    } catch (e) {
      res.status(500).send({ success: false, message: e.message });
    }
  }
);

export default router;
