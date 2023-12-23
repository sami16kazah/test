import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import router from './routes/router.js';
import cookieSession from 'cookie-session';
// to access .env variables
dotenv.config();
// express freamwork decleration
const app = express();
// client send data as json
app.use(express.json());
// helmet for secure http requests by setting various http headers
app.use(helmet());
// to prevent mongo injection attack
app.use(mongoSanitize());
app.use(
  cookieSession({
    // signed false to https only
    //signed : false,
    secret: process.env.COOKIE_KEY,
    maxAge: 604800000, // one week before expire
  })
);
// to use the router
app.use(router);

export default app;
