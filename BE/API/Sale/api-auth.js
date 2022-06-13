const router = require('express').Router();
const User = require('../../models/user-model');
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");
const jwt = require("jsonwebtoken");
const _MODULE = 'SALE';
const {
  getModule,
  checkAccount,
  getRole,
  generateAccessToken } = require('../common');


let refershTokens = [];



router.get('/profile', authenticateSaleToken, async (req, res) => {
  let user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      msg: `User not found!`
    })
  }
  return res.status(200).json({
    msg: `Get profile info successfully!`,
    fullname: user.fullname
  })
})


router.post("/login", (req, res) => {
  let { username, password } = req.body;

  Promise.all([getModule(_MODULE), checkAccount(username, password)])
    .then(rs => {
      if (rs[0].users.includes(rs[1]._id)) {
        let u = {
          _id: rs[1]._id
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
      }else{
        return res.status(403).json({
          msg:`You have no permission to access this module!`
        })
      }
    })
    .catch(err => {
      console.log(err);
      return res.status(err.code).json({
        msg: `${new Error(err.msg)}`
      })
    })
})



module.exports = router;

