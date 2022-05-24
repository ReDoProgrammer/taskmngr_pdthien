require("dotenv").config();
const jwt = require("jsonwebtoken");
const Customer = require('../BE/models/customer-model');


function authenticateCustomerToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json({
    msg: `Lỗi xác thực tài khoản. token null`
  });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log('got an error when veryfy account: ', new Error(err.message));

      return res.status(403).json({
        msg: `Lỗi xác thực tài khoản ${err.message}`
      });

    }

    Customer
      .countDocuments({ _id: user._id }, (err, count) => {
        if (err) {
          return res.status(500).json({
            msg: `Can not check account with error: ${new Error(err.message)}`
          })
        }

        if (count == 0) {
          return res.status(404).json({
            msg: `Account not found!`
          })
        }

        req.user = user;
        next();
      });

  });
}




module.exports = {
  authenticateCustomerToken
}
