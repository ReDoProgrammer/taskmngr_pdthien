const MODULE = 'ADMIN_HOME';
const router = require('express').Router();
const { authenticateAdminToken } = require("../../../middlewares/middleware");
const UserGroup = require('../../models/user-group-model');
const User = require('../../models/user-model');


router.get('/',authenticateAdminToken,(req,res)=>{
    let {page,limit,search} = req.query;
    UserGroup.find({
        $or:[
            { name: { $regex: search, $options: "i" } },
            { meta: { $regex: search, $options: "i" } },
        ]
    })
    .sort({order:1})
    .skip((page-1)*parseInt(limit))
    .limit(parseInt(limit))
    .select('name')
    .exec((err,groups)=>{
        if(err){
            console.log('Load danh sách môn thất bại. Lỗi: '+err.message);
            return res.status(500).json({
                msg:'Load danh sách nhóm user thất bại!',
                error:err.message
            });
        }

        return res.status(200).json({
            msg:'Load danh sách nhóm người dùng thành công!',
            groups:groups
        });
    });
});


router.post("/login", (req, res) => {
    let { username, password } = req.body;
  
  console.log({ username, password });

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
              console.log(user.group,group._id);
              if(user.group.equals(group._id)){
                  let u = {
                    _id: user._id,
                    group:user.group
                  };
                  const accessToken = generateAccessToken(u);
                  const refreshToken = jwt.sign(u, process.env.REFRESH_TOKEN_SECRET);
      
                  refershTokens.push(refreshToken);
                  return res.status(200).json({
                    msg:'Đăng nhập thành công!',
                    accessToken: accessToken,
                    refreshToken: refreshToken,
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

  module.exports = router;