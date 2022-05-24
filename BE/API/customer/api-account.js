const router = require('express').Router();
const Customer = require('../../models/customer-model');
const jwt = require("jsonwebtoken");
const { authenticateCustomerToken } = require("../../../middlewares/customer-middleware");
const {
    generateAccessToken
  } = require('../common')
   
let refershTokens = [];

router.get('/profile',authenticateCustomerToken,(req,res)=>{
  Customer
  .findById(req.customer._id)
  .exec()
  .then(customer=>{
    if(!customer){
      return res.status(404).json({
        msg:`Customer not found!`
      })      
    }
    return res.status(200).json({
      msg:`Get customer profile successfully!`,
      fullname: `${customer.firstname} ${customer.lastname}`,
      email: customer.email
    })
  })
  .catch(err=>{
    return res.status(500).json({
      msg:`Can not get customer profile with error: ${new Error(err.message)}`
    })
  })
})



router.post("/login", (req, res) => {
  let { email, password } = req.body;
  console.log({ email, password })
  checkAccount(email,password)
  .then(customer=>{
    let cus = {
        _id: customer._id,
        email:customer.email           
      };

      const accessToken = generateAccessToken(cus);
      const refreshToken = jwt.sign(cus, process.env.REFRESH_TOKEN_SECRET);

      refershTokens.push(refreshToken);
      return res.status(200).json({
        msg: 'Login successfully!',
        url: '/customer',
        accessToken: accessToken,
        refreshToken: refreshToken
      });

  })
  .catch(err=>{
      console.log(`Customer login fail with error: ${new Error(err.message)}`);
      return res.status(500).json({
          msg:`Error: ${new Error(err.message)}`
      })
  })
})

router.post('/register',(req,res)=>{

})

module.exports = router;

const checkAccount = (email, password) => {
    return new Promise((resolve, reject) => {
        Customer
            .findOne({ email})
            .exec()
            .then(cus => {
                if (!cus) {
                    return reject({
                        code: 404,
                        msg: `Email not found!`
                    })
                }

                if (!cus.status) {
                    return reject({
                        code: 403,
                        msg: `Your account is not actived!`
                    })
                }

                cus.ComparePassword(password, function (err, isMatch) {
                    if (err) {
                        return reject({
                            code: 403,
                            msg: `Can not check password with error: ${new Error(err.message)}`
                        })
                    }
                    if (isMatch) {
                        return resolve(cus);
                    } else {
                        return reject({
                            code: 403,
                            msg: 'Your password not match!'
                        })
                    }
                });



            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: new Error(err.message)
                });
            })
    })
}
