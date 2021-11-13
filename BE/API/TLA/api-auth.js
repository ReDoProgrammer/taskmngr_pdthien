const router = require('express').Router();
const { TLAMiddleware } = require("../../../middlewares/tla-middleware");
const User = require('../../models/user-model');

const jwt = require("jsonwebtoken");

let refershTokens = [];





router.post("/login", (req, res) => {
    let { username, password } = req.body;
  
 console.log({ username, password } );
    User.findOne({ username: username }, function (err, user) {
      if (err) {
        return res.status(500).json({
          msg: `Hệ thống gặp lỗi khi xác thực tài khoản ${err.message}`,
        });
      }
      if (user) {//if username exist
        
        user.ComparePassword(password, function (err, isMatch) {
          if (err) {
            return res.status(500).json({
              msg: `Hệ thống gặp lỗi khi xác thực tài khoản ${err.message}`,
            });
          }
          if (isMatch) {
            UserGroup.findOne({}, {}, { sort: { 'created_at' : -1 } }, function(err, group) {
              if(user.group.equals(group._id)){
                console.log(user.group);
                  let u = {
                    _id: user._id,
                    group:user.group.name
                  };
                  const accessToken = generateAccessToken(u);
                  const refreshToken = jwt.sign(u, process.env.REFRESH_TOKEN_SECRET);
      
                  refershTokens.push(refreshToken);
                  return res.status(200).json({
                    msg:'Đăng nhập thành công!',
                    url:'/tla',
                    accessToken: accessToken,
                    refreshToken: refreshToken
                  });
                }else{
                  return res.status(401).json({
                    msg:'Bạn không có quyền truy cập modul này!'
                  })
                }
            });            
          } else {
            return res.status(401).json({
              msg: "Mật khẩu không chính xác",
            });
          }
        });
      } else {
        return res.status(401).json({
          msg: "Tài khoản không tồn tại. Vui lòng kiểm tra lại",
        });
      }
    });
  });


  function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "72h" });
  }
  module.exports = router;