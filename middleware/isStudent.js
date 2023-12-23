export const isStudent = (req, res, next) => {
  if (req.user.type !== 'student') {
    return res.status(401).send('sorry you are not a student');
  }
  next();
};
