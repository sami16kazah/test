export const isStudent = (req, res, next) => {
  if (req.user.type !== 'student') {
    return res.redirect('/home');
  }
  next();
};
