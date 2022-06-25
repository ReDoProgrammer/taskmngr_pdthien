require("dotenv").config();
const jwt = require("jsonwebtoken");
const _MODULE = 'DC';
const { getModule } = require('./common');

function authenticateDCToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json({
    msg: `Token null`,
    url: '/dc/login'
  });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log('got an error when veryfy account: ', new Error(err.message));

      return res.status(403).json({
        msg: `Can not authenticate this account with error:  ${err.message}`
      });

    }

    getModule(_MODULE)
      .then(m => {
        if (m.users.includes(user._id)) {
          req.user = user;
          next();
        } else {
          return res.status(403).json({
            msg: `You can not access this module!`,
            url: '/dc/login'
          })
        }
      })
      .catch(err => {
        console.log(err);
        return res.status(err.code).json({
          msg: err.msg,
          url: '/dc/login'
        })
      })
  });
}




module.exports = {
  authenticateDCToken
}
