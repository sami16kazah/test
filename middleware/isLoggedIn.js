import jwt from 'jsonwebtoken';
export const isLoggedin = (req, res, next) => {
  if (!req.session || !req.session.payload) {
    return res.status(401).send('you are not logged in');
  }
  jwt.verify(req.session.payload, process.env.JSON_KEY, (error, payload) => {
    if (error) {
      return res.status(401).send('Invalid json web token');
    } else {
      req.user = payload;
      next();
    }
  });
};
