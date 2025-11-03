module.exports = function(req, res, next) {
  if (req.isAuthenticated()) return next(); // user is logged in!!
  res.redirect('/login'); // redirect if not authenticated!!!!!
};
