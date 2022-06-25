const router = require('express').Router();
const User = require('../../models/user-model');
const jwt = require("jsonwebtoken");
const _MODULE = 'QA';
const { authenticateQAToken } = require('../../../middlewares/qa-middleware');

const {
  generateAccessToken,
  getModule,
  checkAccount
} = require('../common')


let refershTokens = [];



router.post("/login", async (req, res) => {
  let { username, password } = req.body;

  Promise.all([getModule(_MODULE), checkAccount(username, password)])
    .then(rs => {
      if (!rs[0].users.includes(rs[1]._id)) {
        return res.status(403).json({
          msg: `You can not access this module!`,
          url: '/qa/login'
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
        url: '/qa',
        accessToken: accessToken,
        refreshToken: refreshToken
      });

    })
    .catch(err => {
      console.log(err);
      return res.status(err.code).json({
        msg: `${new Error(err.msg)}`,
        url: '/qa/login'
      })
    })
})

router.get('/', authenticateQAToken, async (req, res) => {
  let user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      msg: `User not found!`,
      url: '/qa/login'
    })
  }

  return res.status(200).json({
    msg: `Load user profile successfully!`,
    fullname: user.fullname
  })
})



module.exports = router;

