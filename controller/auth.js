import UserModel from '../models/user.js';
import { compares } from '../utils/AES.js';
import Jwt from 'jsonwebtoken';
export const getLoginPage = (req, res, next) => {
  res.send('hello my friend');
};

export const AddUser = async (req, res, next) => {
  try {
    let { name, email, password, type } = req.body;

    const check = await UserModel.findOne({ email });
    if (check) {
      return res.status(400).send('user already registerd');
    }

    const user = await UserModel.create({ name, email, password, type });
    res.send(user);
  } catch (error) {
    console.log(error);
  }
};

export const Login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(401).send('your not authourize');
  }
  const check = compares(password, user.password);
  if (check) {
    const payload = { id: user._id, name: user.name, type: user.type };
    const jwt = Jwt.sign(payload, process.env.JSON_KEY);
    // to generate cookie
    req.session = { payload: jwt };
    //
    return res.status(200).send({ payload });
  }
  return res.status(400).send('something bad happened');
};
