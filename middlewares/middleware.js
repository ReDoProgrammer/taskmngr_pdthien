require("dotenv").config();
const jwt = require("jsonwebtoken");
const _MODULE = 'ADMIN';
const { getModule } = require('../middlewares/common');



async function authenticateAdminToken(req, res, next) {
  const authHeader = await req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log(`Authenticate failed. token null`)
    return res.status(401).json({
      msg: `Authenticate failed. token null`
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) {
      console.log('got an error when veryfy account: ', new Error(err.message));
      return res.status(403).json({
        msg: `Lỗi xác thực tài khoản ${err.message}`
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
            url: '/admin/login'
          })
        }
      })
      .catch(err => {
        console.log(err);
        return res.status(err.code).json({
          msg: err.msg
        })
      })

  });
}


module.exports = {
  authenticateAdminToken
}
