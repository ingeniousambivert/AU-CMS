module.exports = checkSignIn = (req, res, next) => {
  if (req.session.admin && req.cookies.admin_key) {
    next();
  } else {
    res.render("admin/login", {
      succ: false,
      err: true
    });
  }
};
