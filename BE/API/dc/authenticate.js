const router = require('express').Router();
const User = require('../../models/user-model');
const jwt = require("jsonwebtoken");
const { authenticateDCToken } = require("../../../middlewares/dc-middleware");
const _MODULE = 'DC';
const {
  generateAccessToken,
  getModule,
  checkAccount
} = require('../common')
 

let refershTokens = [];

router.get('/profile',authenticateDCToken,async (req,res)=>{
  let user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      msg: `User not found!`,
      url: '/dc/login'
    })
  }

  return res.status(200).json({
    msg: `Load user profile successfully!`,
    fullname: user.fullname
  })
})



router.post("/login", async (req, res) => {
  let { username, password } = req.body;
  Promise.all([getModule(_MODULE), checkAccount(username, password)])
    .then(rs => {
      if (!rs[0].users.includes(rs[1]._id)) {
        return res.status(403).json({
          msg: `You can not access this module!`,
          url: '/dc/login'
        })
      }
      let u = {
        _id: rs[1]._id
      };

      const accessToken = generateAccessToken(u);
      const refreshToken = jwt.sign(u, process.env.REFRESH_TOKEN_SECRET);

      refershTokens.push(refreshToken);
      return res.status(200).json({
        msg: 'Login successfully!',
        url: '/dc',
        accessToken: accessToken,
        refreshToken: refreshToken
      });

    })
    .catch(err => {
      console.log(err);
      return res.status(err.code).json({
        msg: `${new Error(err.msg)}`,
        url: '/dc/login'
      })
    })
})

router.put('/change-password',authenticateDCToken,async (req,res)=>{
  let {current_password,new_password} = req.body;
  if(current_password.length == 0){
    return res.status(403).json({
      msg:`Current password is invalid!`
    })
  }
  if(new_password.length == 0){
    return res.status(403).json({
      msg:`New password is invalid!`
    })
  }
  let user = await User.findById(req.user._id); 
  checkAccount(user.username, current_password)
  .then(async _=>{
    user.password = new_password;
    await user.save()
    .then(_=>{
      return res.status(200).json({
        msg:`Your password has been changed successfully!`
      })
    })
    .catch(err=>{
      return res.status(500).json({
        msg:`You can not change password with error: ${new Error(err.message)}`
      })
    })
  })
  .catch(err=>{
    console.log(err)
    return res.status(err.code).json({
      msg:err.msg
    })
  })
})


module.exports = router;

