const router = require('express').Router();
const { authenticateAdminToken } = require("../../../middlewares/middleware");
const User = require('../../models/user-model');
const Group = require('../../models/user-group-model');
const Level = require('../../models/staff-level-model');
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
    msg: `Load users list successfully!`,
    pageSize,
    users,
    pages: count % pageSize == 0 ? count / pageSize : Math.floor(count / pageSize) + 1
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

router.post('/', authenticateAdminToken, async (req, res) => {
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

  let group = await Group.findById(user_group);
  if (!group) {
    return res.status(404).json({
      msg: `User group not found!`
    })
  }


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
  await u.save()
    .then(async _ => {
     
        Promise.all([PushUserIntoGroup(user_group,u._id),PushUserIntoLevel(user_level,u._id)])
        .then(_=>{
          return res.status(201).json({
            msg:`User has been created`
          })
        })
        .catch(err=>{
          return res.status(err.code).json({
            msg:err.msg
          })
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

router.put('/', authenticateAdminToken, async (req, res) => {
  let {
    user_group,
    user_level,
    userId,
    fullname,
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

  let user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      msg: `User not found!`
    })
  }
  let oLevel = user.user_level;
  let oGroup = user.user_group;
  user.user_group = user_group;
  user.user_level = user_level;
  user.fullname = fullname;
  user.password = password;
  user.phone = phone;
  user.email = email;
  user.idNo = idNo;
  user.issued_by = issued_by;
  user.address = address;
  user.is_active = is_active;
  user.bank = bank;
  user.bank_no = bank_no;
  user.bank_holder = bank_holder;

  user.updated = {
    by:req.user._id,
    at: new Date()
  }

  await user.save()
  .then(_=>{
    Promise.all([
      PullUserFromGroup(oGroup,user._id),
      PullUserFromLevel(oLevel,user._id),
      PushUserIntoGroup(user_group,user._id),
      PushUserIntoLevel(user_level,user._id)
    ])
    .then(_=>{
      return res.status(200).json({
        msg:`User has been updated!`
      })
    })
    .catch(err=>{
      return res.status(err.code).json({
        msg:err.msg
      })
    })
  })
  .catch(err=>{
    return res.status(500).json({
      msg:`Can not update user with error: ${new Error(err.message)}`
    })
  })

})

router.delete('/', authenticateAdminToken,async (req, res) => {
  let { userId } = req.body;
  let user = await User.findById(userId);
  if(!user){
    return res.status(404).json({
      msg:`User not found!`
    })
  }

  await user.delete()
  .then(_=>{
    Promise.all([ PullUserFromGroup(user.user_group,user._id),PullUserFromLevel(user.user_level,user._id)])
    .then(_=>{
      return res.status(200).json({
        msg:`User has been deleted!`
      })
    })
    .catch(err=>{
      return res.status(err.code).json({
        msg:err.msg
      })
    })
  })
  .catch(err=>{
    return res.status(500).json({
      msg:`Can not delete user with error: ${new Error(err.message)}`
    })
  })

})


router.get('/profile', authenticateAdminToken, async (req, res) => {
  let user = await User.findById(req.user._id);
  if (!user) {
    return res.status(401).json({
      msg: `Need login to access this module`,
      url: '/admin/login'
    })
  }
  return res.status(200).json({
    msg: `Load user profile successfully!`,
    fullname: user.fullname
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
      } else {
        return res.status(409).json({
          msg: `You can not access this module!`,
          url: '/admin/login'
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

const PushUserIntoGroup = (groupId,userId)=>{
  return new Promise(async(resolve,reject)=>{
    let group = await Group.findById(groupId);
    if(!group){
      return reject({
        code:404,
        msg:`User group not found!`
      })
    }
    group.users.push(userId);
    await group.save()
    .then(_=>{
      return resolve(group);
    })
    .catch(err=>{
      return reject({
        code:500,
        msg:`Can not add user into group with error: ${new Error(err.message)}`
      })
    })
  })
}

const PullUserFromGroup = (groupId,userId)=>{
  return new Promise(async (resolve,reject)=>{
    let group = await Group.findById(groupId);
    if(!group){
      return reject({
        code:404,
        msg:`User group not found!`
      })
    }
    group.users.pull(userId);
    await group.save()
    .then(_=>{
      return resolve(group);
    })
    .catch(err=>{
      return reject({
        code:500,
        msg:`Can not remove user from old group with error: ${new Error(err.message)}`
      })
    })
  })
}

const PushUserIntoLevel = (levelId,userId)=>{
  return new Promise(async (resolve,reject)=>{
    let level = await Level.findById(levelId);
    if(!level){
      return reject({
        code:404,
        msg:`User level not found`
      })
    }
    level.users.push(userId);
    await level.save()
    .then(_=>{
      return resolve(level);
    })
    .catch(err=>{
      return reject({
        code:500,
        msg:`Can not add user into level with error: ${new Error(err.message)}`
      })
    })
  })
}

const PullUserFromLevel = (levelId,userId)=>{
  return new Promise(async (resolve,reject)=>{
    let level = await Level.findById(levelId);
    if(!level){
      return reject({
        code:404,
        msg:`User level not found!`
      })
    }
    level.users.pull(userId);
    await level.save()
    .then(_=>{
      return resolve(level)
    })
    .catch(err=>{
      return reject({
        code:500,
        msg:`Can not remove user from old level with error: ${new Error(err.message)}`
      })
    })
  })
}

