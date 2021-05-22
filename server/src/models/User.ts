import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';
import IUserModel from '../interfaces/IUser';

const DocumentSchema = new Schema(
  {
    title: String,
    id: String,
  },
  { _id: false }
);

const User: Schema<IUserModel> = new Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  documents: [DocumentSchema],
});

User.pre('save', async function hashPassword(next) {
  try {
    const salt: string = await bcrypt.genSalt(10);
    const hashedPassword: string = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (e) {
    next(e);
  }
});

User.methods.checkPassword = async function checkPassword(
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export default model<IUserModel>('User', User);
