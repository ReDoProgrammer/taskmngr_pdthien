const router = require('express').Router();
const User = require('../../models/user-model');
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");
const jwt = require("jsonwebtoken");
const _MODULE = 'SALE';
const {
  getModule,
  checkAccount,
  getRole,
  generateAccessToken}  = require('../common');
 

let refershTokens = [];



router.get('/profile',authenticateSaleToken,(req,res)=>{
  User
  .findById(req.user._id)
  .exec()
  .then(user=>{
    if(!user){
      return res.status(404).json({
        msg:`User not found!`
      })      
    }
    return res.status(200).json({
      msg:`Get user profile successfully!`,
      fullname: user.fullname
    })
  })
  .catch(err=>{
    return res.status(500).json({
      msg:`Can not get user profile with error: ${new Error(err.message)}`
    })
  })
})


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
            msg: 'Login successfully!',
            url: '/sale',
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
    console.log(err);
    return res.status(err.code).json({
      msg: `${new Error(err.msg)}`
    })
  })
})



module.exports = router;

