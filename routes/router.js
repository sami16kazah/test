import express from 'express';
import { rateLimiterMiddleware } from '../middleware/rateLimiter.js';
import {
  getLoginPage,
  AddUser,
  Login,
  getSignup,
  getHome,
  getadditionalinfo,
  getInfo,
  logout,
  getHomePage,
  getaddmarks,
  getMarks,
} from '../controller/auth.js';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validationResult.js';
import { isLoggedin } from '../middleware/isLoggedIn.js';
import { isDoctor } from '../middleware/IsDoctor.js';
import { isStudent } from '../middleware/isStudent.js';

let router = express.Router();

router.get('/signup', rateLimiterMiddleware, getSignup);
router.post(
  '/signup',
  rateLimiterMiddleware,
  [
    // Validate the request body
    body('name').isString().notEmpty().withMessage('name must be string'),
    body('email').isEmail().notEmpty().withMessage('Email Must Be Valid !'),
    body('password')
      .isString()
      .notEmpty()
      .trim()

      .withMessage('Password Must Be Between 6 And 20 Characters !'),
    body('type')
      .isString()
      .notEmpty()
      .custom((value) => {
        if (value !== 'student' && value !== 'dr') {
          throw new Error('Invalid user type!');
        }
        return true;
      })
      .withMessage('Invalid user type  !'),
    // Validate the request query
  ],
  validateRequest,

  AddUser
);
router.get('/login', rateLimiterMiddleware, getLoginPage);
router.post(
  '/login',
  rateLimiterMiddleware,
  [
    body('email').isEmail().notEmpty().withMessage('Email Must Be Valid !'),
    body('password')
      .isString()
      .notEmpty()
      .trim()

      .withMessage('Password Must Be Between 6 And 20 Characters !'),

    // Validate the request query
  ],
  validateRequest,

  Login
);
router.get('/', rateLimiterMiddleware, isLoggedin, isStudent, getHome);
router.get('/home', rateLimiterMiddleware, isLoggedin, isDoctor, getHomePage);
router.get(
  '/additionalinfo',
  rateLimiterMiddleware,
  isLoggedin,
  isStudent,
  getadditionalinfo
);
router.get(
  '/addmarks',
  rateLimiterMiddleware,
  isLoggedin,
  isDoctor,
  getaddmarks
);
router.get(
  '/previewInfo',
  rateLimiterMiddleware,
  isLoggedin,
  isStudent,
  getInfo
);
router.get(
  '/previewMarks',
  rateLimiterMiddleware,
  isLoggedin,
  isDoctor,
  getMarks
);
router.post('/logout', logout);
export default router;
