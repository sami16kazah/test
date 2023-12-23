import express from 'express';
import { rateLimiterMiddleware } from '../middleware/rateLimiter.js';
import { getLoginPage, AddUser, Login } from '../controller/auth.js';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validationResult.js';
import { isLoggedin } from '../middleware/isLoggedIn.js';
import { isDoctor } from '../middleware/IsDoctor.js';
let router = express.Router();

router.get('/signup', rateLimiterMiddleware);
router.post(
  '/signup',
  rateLimiterMiddleware,
  [
    // Validate the request body
    body('name').isString().notEmpty(),
    body('email').isEmail().notEmpty().withMessage('Email Must Be Valid !'),
    body('password')
      .isString()
      .notEmpty()
      .trim()
      .isLength({ min: 6, max: 20 })
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
      .isLength({ min: 6, max: 20 })
      .withMessage('Password Must Be Between 6 And 20 Characters !'),

    // Validate the request query
  ],
  validateRequest,

  Login
);
router.get('/home', rateLimiterMiddleware, isLoggedin, (req, res, next) => {
  res.send('hello from home');
});
export default router;