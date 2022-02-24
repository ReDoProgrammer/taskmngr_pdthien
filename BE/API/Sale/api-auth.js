const router = require('express').Router();
const User = require('../../models/user-model');
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");
const jwt = require("jsonwebtoken");
const _MODULE = 'SALE';
const {
  generateAccessToken,
  getRole,
  getModule
} = require('../common')
 

let refershTokens = [];



router.get('/profile',authenticateSaleToken,(req,res)=>{
  User
  .findById(req.user._id)
  .exec()
  .then(user=>{
    if(!user){
      return res.status(404).json({
        msg:`User not found!`
      })      
    }
    return res.status(200).json({
      msg:`Get user profile successfully!`,
      fullname: user.fullname
    })
  })
  .catch(err=>{
    return res.status(500).json({
      msg:`Can not get user profile with error: ${new Error(err.message)}`
    })
  })
})


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
    if (!user.is_active) {
      return res.status(403).json({
        msg: `Your account is not active`
      })
    }

    user.ComparePassword(password, function (err, isMatch) {
      if (err) {
        return res.status(500).json({
          msg: `Can not auth this account:  ${err.message}`,
        });
      }


      if (isMatch) {
        getModule(_MODULE)
          .then(result => {
            getRole(result.mod._id, user._id)
              .then(_ => {

                let u = {
                  _id: user._id                
                };

                const accessToken = generateAccessToken(u);
                const refreshToken = jwt.sign(u, process.env.REFRESH_TOKEN_SECRET);

                refershTokens.push(refreshToken);
                return res.status(200).json({
                  msg: 'Login successfully!',
                  url: '/sale',
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
  })
})



module.exports = router;

