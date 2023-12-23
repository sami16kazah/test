export const isDoctor = (req, res, next) => {
  if (req.user.type !== 'dr') {
    return res.status(401).send('sorry you are not a doctor');
  }
  next();
};
