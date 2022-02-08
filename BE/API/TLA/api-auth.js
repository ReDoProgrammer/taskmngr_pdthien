const router = require('express').Router();
const { TLAMiddleware } = require("../../../middlewares/tla-middleware");
const User = require('../../models/user-model');
const jwt = require("jsonwebtoken");
const Module = require('../../models/module-model');
const UserModule = require('../../models/user-module-model');
let refershTokens = [];





router.post("/login", (req, res) => {
  let { username, password } = req.body;

  User.findOne({ username: username }, function (err, user) {
    if (err) {
      return res.status(500).json({
        msg: `Can not authenticate with error: ${err.message}`,
      });
    }

    //nếu tài khoản không khớp
    if (!user) {
      return res.status(404).json({
        msg: 'Account not found'
      });
    }


    //nếu tài khoản đang không hoạt động
    if(!user.is_active){
      return res.status(403).json({
        msg:`Your account is not active`
      })
    }






    user.ComparePassword(password, function (err, isMatch) {
      if (err) {
        return res.status(500).json({
          msg: `Can not auth this account:  ${err.message}`,
        });
      }


      if (isMatch) {
        getTLAModule
          .then(result => {
            getRole(result.mod._id, user._id)
              .then(_ => {
                
                let u = {
                  _id: user._id,
                  is_tla: true
                };

                const accessToken = generateAccessToken(u);
                const refreshToken = jwt.sign(u, process.env.REFRESH_TOKEN_SECRET);

                refershTokens.push(refreshToken);
                return res.status(200).json({
                  msg: 'Login successfully!',
                  url: '/tla',
                  accessToken: accessToken,
                  refreshToken: refreshToken
                });
              })
              .catch(err => {
                return res.status(err.code).json({
                  msg: err.msg
                })
              })
          })
          .catch(err => {
            return res.status(err.code).json({
              msg: err.msg
            })
          })
      } else {
        return res.status(401).json({
          msg: "Password not match",
        });
      }
    });


  });
});




module.exports = router;

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "72h" });
}

const getRole = (moduleId, userId) => {
  return new Promise((resolve, reject) => {
    UserModule.countDocuments({ user: userId, module: moduleId }, (err, count) => {
      if (err) {
        return reject({
          code: 500,
          msg: `Can not check user module role with error: ${new Error(err.message)}`
        })
      }
      if (count == 0) {
        return reject({
          code: 403,
          msg: `You can not access this module`
        })
      }
      return resolve({
        code: 200,
        msg: `You can access this module`
      })
    })
  })
}

const getTLAModule = new Promise((resolve, reject) => {
  Module.find({ name: 'TLA' })
    .exec()
    .then(mod => {
      return resolve({
        msg: `Module found`,
        mod
      })
    })
    .catch(err => {
      return reject({
        code: 500,
        msg: `Can not find module with error: ${new Error(err.message)}`
      })
    })
})