require("dotenv").config();
const jwt = require("jsonwebtoken");
const _MODULE = 'SALE';
const Module = require('../BE/models/module-model');
function authenticateSaleToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json({
    msg: `Lỗi xác thực tài khoản. token null`
  });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log('got an error when veryfy account: ', new Error(err.message));

      return res.status(403).json({
        msg: `Can not authenticate this account with error:  ${err.message}`
      });

    }

    getModuleId
      .then(mod => {
        UserModule
          .countDocuments({ user: user._id, module: mod._id }, (err, count) => {
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
        return res.status(err.code).json({
          msg: err.msg
        })
      })

  });
}




module.exports = {
  authenticateSaleToken
}


const getModuleId = new Promise((resolve, reject) => {
  Module
    .findOne({ name: _MODULE })
    .exec()
    .then(mod => {
      if (!mod) {
        return reject({
          code: 404,
          msg: `Module not found`
        })
      }
      return resolve({
        code: 200,
        msg: `Module found`,
        mod
      })
    })
    .catch(err => {
      return reject({
        code: 500,
        msg: `Can not get module with error: ${new Error(err.message)}`
      })
    })
})