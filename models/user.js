import mongoose from 'mongoose';
import { encrypt } from '../utils/AES.js';
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['student', 'dr'],
    default: 'student',
  },
});
userSchema.pre('save', async function (next) {
  try {
    if (this.isNew) {
      const salt = process.env.AES_KEY;
      const hashedPassword = await encrypt(this.password, salt);
      this.password = hashedPassword;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const UserModel =
  mongoose.models.UserModel || mongoose.model('UserModel', userSchema);

export default UserModel;
