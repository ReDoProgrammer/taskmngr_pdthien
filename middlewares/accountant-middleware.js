require("dotenv").config();
const jwt = require("jsonwebtoken");
const _MODULE = 'ACCOUNTANT';
const { getModule } = require('./common');

function authenticateAccountantToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json({
    msg: `Lỗi xác thực tài khoản. token null`
  });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log('got an error when veryfy account: ', new Error(err.message));

      return res.status(403).json({
        msg: `Lỗi xác thực tài khoản ${err.message}`,
        url:'/accountant/login'
      });

    }

    getModule(_MODULE)
      .then(m => {       
        if (m.users.includes(user._id)) {
          req.user = user;
          next();
        } else {
          return res.status(403).json({
            msg: `You have no permission to access this module!`,
            url:'/accountant/login'
          })
        }

      })
      .catch(err => {
        console.log(err);
        return res.status(err.code).json({
          msg: err.msg,
          url:'/accountant/login'
        })
      })

  });
}

module.exports = {
  authenticateAccountantToken
}
