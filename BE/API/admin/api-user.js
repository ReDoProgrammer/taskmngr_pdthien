const router = require('express').Router();
const { authenticateAdminToken } = require("../../../middlewares/middleware");
const User = require('../../models/user-model');

const jwt = require("jsonwebtoken");

let refershTokens = [];


router.get('/', authenticateAdminToken, (req, res) => {
  let { search, page } = req.query;
  User.find({
    $or: [
      { fullname: { "$regex": search, "$options": "i" } },
      { email: { "$regex": search, "$options": "i" } },
      { phone: { "$regex": search, "$options": "i" } },
      { username: { "$regex": search, "$options": "i" } },
    ]
  })
    .select('fullname address phone email is_admin is_sale is_tla is_qc is_accountant is_active')
    .exec()
    .then(users => {
      let result = users.slice(process.env.PAGE_SIZE*(page-1),process.env.PAGE_SIZE);  
      return res.status(200).json({
        msg: 'Load users list successfully!',
        pages:users.length%process.env.PAGE_SIZE==0?users.length/process.env.PAGE_SIZE:Math.floor(users.length/process.env.PAGE_SIZE)+1,
        users: result
      })
    })
    .catch(err => {
      return res.status(500).json({
        msg: 'Can not load users list',
        error: new Error(err.message)
      })
    })
})

router.post('/', authenticateAdminToken, (req, res) => {
  let { user_type, fullname, username, password, phone,email, idNo,issued_by, address, is_active, bank, bank_no, bank_name, is_admin, is_tla, is_qc, is_sale, is_accountant ,is_employee} = req.body;
  
  let u = new User({
    user_type,
    fullname,
    username,
    password,
    phone,
    email,
    idNo,
    issued_by,
    address,
    is_active,
    bank,
    bank_no,
    bank_name,
    is_admin,
    is_sale,
    is_qc,
    is_tla,
    is_accountant,
    is_employee
  });
  u.save()
    .then(user => {
      return res.status(201).json({
        msg: 'New user was created successfully!',
        user: user
      })
    })
    .catch(err => {
      console.log(new Error(err.message));
      return res.status(500).json({
        msg: 'Can not create a new user',
        error: new Error(err.message)
      })
    })
})




router.post("/login", (req, res) => {
  let { username, password } = req.body;


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

          let u = {
            _id: user._id,
            is_admin: user.is_admin
          };
          const accessToken = generateAccessToken(u);
          const refreshToken = jwt.sign(u, process.env.REFRESH_TOKEN_SECRET);

          refershTokens.push(refreshToken);
          return res.status(200).json({
            msg: 'Đăng nhập thành công!',
            url: '/admin',
            accessToken: accessToken,
            refreshToken: refreshToken
          });
        } else {
          return res.status(401).json({
            msg: 'Bạn không có quyền truy cập modul này!'
          })
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