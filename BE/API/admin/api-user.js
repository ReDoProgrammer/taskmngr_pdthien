const router = require('express').Router();
const { authenticateAdminToken } = require("../../../middlewares/middleware");
const User = require('../../models/user-model');
const UserModule = require('../../models/user-module-model');
const Module = require('../../models/module-model');
const jwt = require("jsonwebtoken");

let refershTokens = [];



router.get('/', authenticateAdminToken, (req, res) => {
  let { search, page } = req.query;
  User.find({
    username:{$ne:'admin'},
    $or: [
      { fullname: { "$regex": search, "$options": "i" } },
      { email: { "$regex": search, "$options": "i" } },
      { phone: { "$regex": search, "$options": "i" } },
      { username: { "$regex": search, "$options": "i" } },
    ]
  })

    .exec()
    .then(users => {
      let result = users.slice(process.env.PAGE_SIZE * (page - 1), process.env.PAGE_SIZE);
      return res.status(200).json({
        msg: 'Load users list successfully!',
        pages: users.length % process.env.PAGE_SIZE == 0 ? users.length / process.env.PAGE_SIZE : Math.floor(users.length / process.env.PAGE_SIZE) + 1,
        users: result
      })
    })
    .catch(err => {
      return res.status(500).json({
        msg: 'Can not load users list',
        error: new Error(err.message)
      })
    })
})

router.get('/list', authenticateAdminToken, (req, res) => {
  User
    .find({username:{$ne:'admin'}})
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

router.post('/', authenticateAdminToken, (req, res) => {
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
  u.save()
    .then(user => {
      console.log('user: ',user);
      return res.status(201).json({
        msg: 'New user has been created successfully!',
        user: user
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

router.put('/', authenticateAdminToken, (req, res) => {
  let { 
    user_group,
    user_level,
    userId,   
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

  User.findByIdAndUpdate(userId, {
    user_group,
    user_level,
    fullname,
    username,    
    phone,
    email,
    idNo,
    issued_by,
    address,
    is_active,
    bank,
    bank_no,
    bank_holder   
  }, { new: true }, async (err, user) => {
    if (err) {
      return res.status(500).json({
        msg: `Update employee failed with error: ${new Error(err.message)}`,
        error: new Error(err.message)
      })
    }

    if (user == null) {
      return res.status(404).json({
        msg: `Employee not found!!!`
      })
    }
    user.password = password;
    await user.save();
    return res.status(200).json({
      msg: `Update employee info successfully!!`
    })
  })
})

router.delete('/', authenticateAdminToken, (req, res) => {
  let { userId } = req.body;
  User.findByIdAndDelete(userId, (err, user) => {
    if (err) {
      return res.status(500).json({
        msg: `Delete user failed with error: ${new Error(err.message)}`,
        error: new Error(err.message)
      })
    }
    if (user == null) {
      return res.status(404).json({
        msg: `User not found!`
      })
    }

    return res.status(200).json({
      msg: `User has been deleted!`
    })
  })
})



router.post("/login", (req, res) => {
  let { username, password } = req.body;

  Promise.all([getModule, checkAccount(username, password)])
    .then(result => {     
      
      checkRole(result[1]._id, result[0]._id)
        .then(chk => {    
         
          if (chk) {
            let user = result[1];
            let u = {
              _id: user._id,
              is_admin: true
            };

            const accessToken = generateAccessToken(u);
            const refreshToken = jwt.sign(u, process.env.REFRESH_TOKEN_SECRET);

            refershTokens.push(refreshToken);
            return res.status(200).json({
              msg: 'Admin login successfully!',
              url: '/admin',
              accessToken: accessToken,
              refreshToken: refreshToken
            });

          }

        })
        .catch(err => {         
          return res.status(err.code).json({
            msg: err.message
          })
        })
    })
    .catch(err => {
      return res.status(err.code).json({
        msg:`${new Error(err.msg)}`
      })
    })


});


const checkRole = (userId, moduleId) => {
  return new Promise((resolve, reject) => {
    UserModule
      .countDocuments({ module: moduleId, user: userId })
      .exec()
      .then(count => {
        if (count == 0) {
          return reject({
            code: 404,
            msg: `Can not found user module role`
          })
        }
        return resolve(true)
      })
      .catch(err => {
        return reject({
          code: 500,
          msg: `Can not check user role with error: ${new Error(err.message)}`
        })
      })
  })
}

const getModule = new Promise((resolve, reject) =>  {
  
    Module
      .findOne({ name: 'ADMIN' })
      .exec()
      .then(module => {      
        return resolve(module)
      })
      .catch(err => {
        return reject({
          code: 500,
          msg: `Can not get admin module with error: ${new Error(err.message)}`
        });
      })
  })



const checkAccount = (username, password) => {
  return new Promise((resolve, reject) => {
    User
      .findOne({ username: username })
      .exec()
      .then(user => {
        if (!user) {
          return reject({
            code: 404,
            msg: `Username not found`
          })
        }

       

        if(!user.is_active){
          return reject({
            code:403,
            msg:`Your account is banned!`            
          })
        }

        user.ComparePassword(password, function (err, isMatch) {
          if (err) {
            return reject({
              code: 403,
              msg: `Can not check password with error: ${new Error(err.message)}`
            })
          }
          if (isMatch) {
            return resolve(user);
          } else {
            return reject({
              code: 403,
              msg: 'Admin password not match!'
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

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "8h" });
}
module.exports = router;