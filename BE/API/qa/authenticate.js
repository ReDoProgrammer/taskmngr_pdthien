const router = require('express').Router();
const User = require('../../models/user-model');
const jwt = require("jsonwebtoken");
const _MODULE = 'QA';
const { authenticateQAToken } = require('../../../middlewares/qa-middleware');

const {
  generateAccessToken,
  getRole,
  getModule,
  checkAccount
} = require('../common')


let refershTokens = [];



router.post("/login", (req, res) => {
  let { username, password } = req.body;

  Promise.all([getModule(_MODULE), checkAccount(username, password)])
    .then(result => {
      getRole(result[0]._id, result[1]._id)
        .then(chk => {        
          if (chk) {
            let user = result[1];
            let u = {
              _id: user._id           
            };

            const accessToken = generateAccessToken(u);
            const refreshToken = jwt.sign(u, process.env.REFRESH_TOKEN_SECRET);

            refershTokens.push(refreshToken);
            return res.status(200).json({
              msg: 'QA login successfully!',
              url: '/qa',
              accessToken: accessToken,
              refreshToken: refreshToken
            });

          }

        })
        .catch(err => {
          console.log(err);
          return res.status(err.code).json({
            msg: err.message
          })
        })
    })
    .catch(err => {
      return res.status(err.code).json({
        msg: `${new Error(err.msg)}`
      })
    })
})

router.get('/', authenticateQAToken, (req, res) => {
  User
    .findById(req.user._id)
    .exec()
    .then(user => {
      if (!user) {
        return res.status(404).json({
          msg: `User not found!`
        })
      }
      return res.status(200).json({
        msg: `Get user profile successfully!`,
        fullname: user.fullname
      })
    })
    .catch(err => {
      return res.status(500).json({
        msg: `Can not get user profile with error: ${new Error(err.message)}`
      })
    })
})



module.exports = router;

