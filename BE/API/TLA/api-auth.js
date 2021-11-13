const router = require('express').Router();
const { TLAMiddleware } = require("../../../middlewares/tla-middleware");
const User = require('../../models/user-model');
const jwt = require("jsonwebtoken");

let refershTokens = [];





router.post("/login", (req, res) => {
  let { username, password } = req.body;
  
  User.findOne({ username: username }, function (err, user) {
    if (err) {
      return res.status(500).json({
        msg: `Hệ thống gặp lỗi khi xác thực tài khoản ${err.message}`,
      });
    }
    if (user == null) {
      return res.status(401).json({
        msg: 'Account not found'
      });
    } else {
      if (user) {//if username exist

        user.ComparePassword(password, function (err, isMatch) {
          if (err) {
            return res.status(500).json({
              msg: `Can not auth this account:  ${err.message}`,
            });
          }
          if (isMatch) {
            if(user.is_admin || user.is_tla){
              let u = {
                      _id: user._id,
                      role: user.is_admin||user.is_tla
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
            }else {
                  return res.status(401).json({
                    msg: 'Your account could not access this module!'
                  })
                }           
          } else {
            return res.status(401).json({
              msg: "Password not match",
            });
          }
        });
      } else {
        return res.status(401).json({
          msg: "TLA account not match",
        });
      }
    }

  });
});



module.exports = router;

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "72h" });
}