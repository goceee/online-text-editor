import { Router, Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import config from '../helpers/config';
import IJWTData from '../interfaces/IJWTData';
import IRequestBody from '../interfaces/IRequestBody';
import IUserModel from '../interfaces/IUser';
import User from '../models/User';

const router = Router();
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password }: IRequestBody = req.body;
  const user: IUserModel | null = await User.findOne({ email });

  if (user) {
    const isMatch: boolean = await user.checkPassword(password);
    if (isMatch) {
      const token: string = JWT.sign({ id: user.id }, config.secret);
      res.cookie('access', token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        // secure: true,
      });
      res.send({
        success: true,
        message: 'Login successful',
        data: { userId: user.id, documents: user.documents },
      });
      return;
    }
  }
  res.status(401).send({ success: false, message: 'Wrong Email/Password' });
});

router.post('/create', async (req: Request, res: Response): Promise<void> => {
  const { email }: IRequestBody = req.body;
  try {
    if (await User.findOne({ email })) {
      res.status(409).send({
        success: false,
        message:
          'Account already exists, please login or click forgot your password to gain access to your account',
      });
    } else {
      const newUser: IUserModel = new User(req.body);
      await newUser.save();
      res.send({
        success: true,
        message:
          'Account successfully created, please login with your username and password',
      });
      return;
    }
  } catch (e) {
    res.status(500).send({ success: false, message: e.message });
  }
});

router.get(
  '/checkLogin',
  async (req: Request, res: Response): Promise<void> => {
    if (req.cookies.access !== undefined) {
      try {
        const data = <IJWTData>JWT.verify(req.cookies.access, config.secret);
        const user: IUserModel | null = await User.findById(data.id);
        res.send({
          success: user !== null,
          message: user ? 'Login successful' : 'Login unsuccessful',
          data: user ? { userId: user.id, documents: user.documents } : {},
        });
        return;
      } catch (e) {
        res.send({ success: false, message: e });
      }
    }
    res.send({ success: false, message: 'Login unsuccessful' });
  }
);

router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const payload = {
        id: user.id,
      };
      const token = JWT.sign(payload, `${config.secret}${user.id}`, {
        expiresIn: '15m',
      });
      const link = `http://localhost:3000/reset-password/${user.id}/${token}`;
      console.log(link);
      res.send({ success: true, message: 'Password reset link has been sent' });
    } else {
      res.send({ success: false, message: 'User not found' });
    }
  } catch (e) {
    res.status(500).send({ success: false, message: e });
  }
});

router.post(
  '/reset-password/:id/:token',
  async (req: Request, res: Response) => {
    const { id, token } = req.params;
    const newPassword: string = req.body.password;
    try {
      const tokenData = <IJWTData>JWT.verify(token, `${config.secret}${id}`);
      const user: IUserModel | null = await User.findById(tokenData.id);
      if (user) {
        if (user.checkPassword(newPassword))
          res.send({
            success: false,
            message: 'New password cannot be the same as the old one',
          });
        user.password = newPassword;
        await user.save();
        res.send({ success: true, message: 'Password successfully changed' });
      } else {
        res.status(500).send({ success: false, message: 'User not found' });
      }
    } catch (e) {
      res.status(500).send({ success: false, message: e });
    }
  }
);

export default router;
