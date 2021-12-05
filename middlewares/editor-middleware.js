require("dotenv").config();
const jwt = require("jsonwebtoken");

function authenticateEditorToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json({
    msg:`Lỗi xác thực tài khoản. token null`
  });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err)
      {
        console.log('got an error when veryfy account: ',new Error(err.message));
        return res.status(403).json({
          msg:`Lỗi xác thực tài khoản ${err.message}`
        });
  
      }    
    if(!user.is_editor){
      return res.status(403).json({
        msg:`Your account can not access this module`
      });
    }
    req.user = user;   
    next();
  });
}




module.exports = {
  authenticateEditorToken
}
