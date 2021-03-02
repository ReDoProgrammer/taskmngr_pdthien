require("dotenv").config();
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json({
    msg:`Lỗi xác thực tài khoản. token null`
  });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({
        msg:`Lỗi xác thực tài khoản ${err.message}`
      });

    req.user = user;   
    next();
  });
}

function authenticateAdminToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json({
    msg:`Vui lòng đăng nhập để thực hiện thao tác này`,
    error: new Error('token isnull')
  });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({
        msg:`Lỗi xác thực tài khoản ${err.message}`
      });

    // if(!user.is_admin) return res.status(403).json({
    //   msg:`Bạn không có quyền truy cập chức năng này`
    // });
    req.user = user;   
    next();
  });
}


module.exports = {
  authenticateToken,
  authenticateAdminToken
}
