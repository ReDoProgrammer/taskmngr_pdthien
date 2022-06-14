const router = require('express').Router();
const { authenticateAdminToken } = require("../../../middlewares/middleware");
const User = require('../../models/user-model');
const jwt = require("jsonwebtoken");

const { getModule, getRole, checkAccount } = require('../common');

let refershTokens = [];

const _MODULE = 'ADMIN';

const pageSize = 20;

router.get('/', authenticateAdminToken, async (req, res) => {
  let { search, page } = req.query;
  let users = await User.find({
    username: { $ne: 'admin' },
    $or: [
      { fullname: { "$regex": search, "$options": "i" } },
      { email: { "$regex": search, "$options": "i" } },
      { phone: { "$regex": search, "$options": "i" } },
      { username: { "$regex": search, "$options": "i" } },
    ]
  })
    .populate('user_group')
    .populate('user_level')
    .skip((page - 1) * pageSize)
    .limit(pageSize);

  let count = await User.countDocuments({
    username: { $ne: 'admin' },
    $or: [
      { fullname: { "$regex": search, "$options": "i" } },
      { email: { "$regex": search, "$options": "i" } },
      { phone: { "$regex": search, "$options": "i" } },
      { username: { "$regex": search, "$options": "i" } },
    ]
  });

  return res.status(200).json({
    msg:`Load users list successfully!`,
    pageSize,
    users,
    pages:count%pageSize == 0? count/pageSize: Math.floor(count/pageSize)+1
  })


})

router.get('/list', authenticateAdminToken, (req, res) => {
  User
    .find({ username: { $ne: 'admin' } })
    .exec()
    .then(users => {
      return res.status(200).json({
        msg: `Load all users successfully!`,
        users
      })
    })
    .catch(err => {
      console.log(`Can not load all users with error: ${new Error(err.message)}`);
      return res.status(500).json({
        msg: `Can not load all users with error: ${new Error(err.message)}`
      })
    })
})

router.get('/detail', authenticateAdminToken, (req, res) => {
  let { userId } = req.query;
  User
    .findById(userId)
    .exec()
    .then(user => {
      if (user == null) {
        return res.status(404).json({
          msg: `User not found`
        })
      }
      return res.status(200).json({
        msg: `Get user info successfully!!!`,
        user
      })
    })
    .catch(err => {
      return res.status(500).json({
        msg: `Can not get user info with error: ${new Error(err.message)}`,
        error: new Error(err.message)
      })
    })
})

router.post('/', authenticateAdminToken, (req, res) => {
  let {
    user_group,
    user_level,
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
    bank_holder

  } = req.body;



  let u = new User({
    user_group,
    user_level,
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
    bank_holder

  });
  u.save()
    .then(user => {
      return res.status(201).json({
        msg: 'New user has been created successfully!',
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

router.put('/', authenticateAdminToken, (req, res) => {
  let {
    user_group,
    user_level,
    userId,
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
    bank_holder
  } = req.body;

  User.findByIdAndUpdate(userId, {
    user_group,
    user_level,
    fullname,
    username,
    phone,
    email,
    idNo,
    issued_by,
    address,
    is_active,
    bank,
    bank_no,
    bank_holder
  }, { new: true }, async (err, user) => {
    if (err) {
      return res.status(500).json({
        msg: `Update employee failed with error: ${new Error(err.message)}`,
        error: new Error(err.message)
      })
    }

    if (user == null) {
      return res.status(404).json({
        msg: `Employee not found!!!`
      })
    }
    user.password = password;
    await user.save();
    return res.status(200).json({
      msg: `Update employee info successfully!!`
    })
  })
})

router.delete('/', authenticateAdminToken, (req, res) => {
  let { userId } = req.body;
  User.findByIdAndDelete(userId, (err, user) => {
    if (err) {
      return res.status(500).json({
        msg: `Delete user failed with error: ${new Error(err.message)}`,
        error: new Error(err.message)
      })
    }
    if (user == null) {
      return res.status(404).json({
        msg: `User not found!`
      })
    }

    return res.status(200).json({
      msg: `User has been deleted!`
    })
  })
})


router.get('/profile', authenticateAdminToken,async (req, res) => {
  let user = await User.findById(req.user._id);
  if(!user){
    return res.status(401).json({
      msg:`Need login to access this module`,
      url:'/admin/login'
    })
  }
  return res.status(200).json({
    msg:`Load user profile successfully!`,
    fullname:user.fullname
  })
  
})


router.post("/login", (req, res) => {
  let { username, password } = req.body;

  Promise.all([getModule(_MODULE), checkAccount(username, password)])
    .then(async rs => {
      let m = rs[0];
      let user = rs[1];
      let chk = m.users.indexOf(user._id);
      if (chk > -1) {

        let u = {
          _id: user._id
        };

        const accessToken = generateAccessToken(u);
        const refreshToken = jwt.sign(u, process.env.REFRESH_TOKEN_SECRET);

        refershTokens.push(refreshToken);
        return res.status(200).json({
          msg: 'Admin login successfully!',
          url: '/admin',
          accessToken,
          refreshToken
        });
      }else{
        return res.status(409).json({
          msg:`You can not access this module!`,
          url:'/admin/login'
        })
      }

    })
    .catch(err => {
      return res.status(err.code).json({
        msg: `${new Error(err.msg)}`
      })
    })


});








module.exports = router;


function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "8h" });
}