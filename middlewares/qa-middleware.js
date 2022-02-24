require("dotenv").config();
const jwt = require("jsonwebtoken");
const _MODULE = 'QA';
const UserModule = require('../BE/models/user-module-model');
const {getModuleId} = require('./common');

function authenticateQAToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json({
    msg: `Lỗi xác thực tài khoản. token null`
  });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log('got an error when veryfy account: ', new Error(err.message));

      return res.status(403).json({
        msg: `Lỗi xác thực tài khoản ${err.message}`
      });

    }

    getModuleId(_MODULE)
      .then(result => {       
        UserModule
          .countDocuments({ user: user._id, module: result.mod._id }, (err, count) => {
            if (err) {
              return res.status(500).json({
                msg: `Can not check user module with error: ${new Error(err.message)}`
              })
            }

            if (count == 0) {
              return res.status(403).json({
                msg: `You can not access this module`
              })
            }
            req.user = user;
            next();
          })

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
  authenticateQAToken
}
