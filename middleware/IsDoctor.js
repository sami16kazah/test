export const isDoctor = (req, res, next) => {
  if (req.user.type !== 'dr') {
    return res.redirect('/');
  }
  next();
};
