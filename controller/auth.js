import UserModel from '../models/user.js';
import AdditionalInformationModel from '../models/additionalInfo.js';
import { compares } from '../utils/AES.js';
import Jwt from 'jsonwebtoken';
export const getLoginPage = (req, res, next) => {
  res.render('login', {
    path: '/login',
    error: '',
  });
};

export const getSignup = (req, res, next) => {
  res.render('signup', {
    path: '/signup',
    error: '',
  });
};

export const AddUser = async (req, res, next) => {
  try {
    let { name, email, password, type } = req.body;

    const check = await UserModel.findOne({ email });
    if (check) {
      return res.render('signup', {
        path: '/signup',
        error: 'user already registerd',
      });
    }

    const user = await UserModel.create({ name, email, password, type });
    return res.redirect('/login');
  } catch (error) {
    console.log(error);
  }
};

export const Login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.render('login', {
      path: '/login',
      error: 'no user found for this email',
    });
  }
  const check = compares(password, user.password);
  if (check) {
    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      type: user.type,
    };
    const jwt = Jwt.sign(payload, process.env.JSON_KEY);
    // to generate cookie
    req.session = { payload: jwt };
    //
    return res.redirect('/');
  }
  return res.render('login', {
    path: '/login',
    error: 'invalid credintials',
  });
};

export const getHome = (req, res, next) => {
  res.render('home', {
    path: '/home',
    error: '',
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    type: req.user.type,
  });
};

export const getadditionalinfo = (req, res, next) => {
  res.render('additionalinfo', {
    path: '/additionalinfo',
    error: '',
    id: req.user.id,
  });
};

export const getInfo = async (req, res, next) => {
  const additionalInfo = await AdditionalInformationModel.findOne({
    userId: req.user.id,
  });
  res.render('previewInfo', {
    path: '/previewInfo',
    error: '',
    id: req.user.id,
    number: additionalInfo.number,
    phone: additionalInfo.phone,
    city: additionalInfo.city,
  });
};
export const logout = (req, res, next) => {
  req.session = null;
  return res.redirect('/');
};
