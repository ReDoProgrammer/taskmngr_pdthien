const router = require("express").Router();
const User = require("../../models/user-model");
const UserModule = require('../../models/user-module-model');
const Module = require('../../models/module-model');
const { captureRejectionSymbol } = require("node-cron/src/task");





const _MODULES = [
  { name: 'ADMIN', description: 'Quản trị viên hệ thống', appling_wage: false },
  { name: 'DC', description: 'Nhân viên kiểm duyệt đầu ra đơn hàng', appling_wage: true },
  { name: 'ACCOUNTANT', description: 'Kế toán', appling_wage: false },
  { name: 'SALE', description: 'Nhân viên kinh doanh', appling_wage: true },
  { name: 'TLA', description: 'Nhân viên điều phối, quản lý công việc', appling_wage: false },
  { name: 'EDITOR', description: 'Nhân viên chỉnh sửa hình ảnh', appling_wage: true },
  { name: 'QA', description: 'Nhân viên kiểm duyệt hình ảnh', appling_wage: true }

]

const _ROOT_ACCOUNT =new User({
  username:'admin',
  password:'admin',
  fullname:'Administrator',
  idNo:'230752538',
  issued_by:'Gia Lai',
  phone:'0911397764',
  email:'redo2011dht@gmail.com',
  address: 'Chư Ty - Đức Cơ - Gia Lai'
})

router.get("/", (req, res) => {
  res.render("admin/home/index", {
    layout: "layouts/admin-layout",
    title: "Home",

  });
});

router.get("/init", (req, res) => {
 

  Promise.all([initRootAccount,initModules])
  .then(result=>{
    initRootRole(result[0].root._id,result[1].modules[0]._id)
    .then(rs=>{      
      return res.stastus(rs.rl.code).json({
        msg:`Initialize database successfully!`,
        root: result[0].root,
        modules: result[1].modules,
        role: rs.rl
      })
    })
  })
  .catch(err=>{
    return res.status(err.code).json({
      msg:err.msg
    })
  })
  
});






module.exports = router;

const initRootRole = (userId,moduleId)=>{
  return new Promise(async (resolve,reject)=>{
    let role = new UserModule({
      user:userId,
      module:moduleId
    });
    await role.save()
    .then(rl=>{
      return resolve({
        code:201,
        msg:`Initialize root account with role successfully!`,
        rl
      })
    })
    .catch(err=>{
      return reject({
        code:500,
        msg:`Can not initialize root account role with error: ${new Error(err.message)}`
      })
    })
  })
}

const initModules = new Promise((resolve,reject)=>{
  Module.countDocuments({}, (err,count)=>{
    if(err){
      return reject({
        code:500,
        msg:`Can not count modules document with error: ${new Error(err.message)}`
      })
    }

    if(count > 0){
      return reject({
        code:403,
        msg:`These modules already exist in database`
      })
    }

     Module.insertMany(_MODULES,(err,modules)=>{
      if(err){
        return reject({
          code:500,
          msg:`Can not initialize modules with error: ${new Error(err.message)}`
        })
      }
  
      return resolve({
        code:201,
        msg:`Initialize modules list successfully!`,
        modules
      })
    })


  })
 
})

const initRootAccount = new Promise((resolve,reject)=>{
  User.countDocuments({},async (err,count)=>{
    if(err){
      return reject({
        code:500,
        msg:`Can not count users with error: ${new Error(err.message)}`
      })
    }

    if(count > 0){
      return reject({
        code:403,
        msg:`Account already exist in database`
      })
    }

    await _ROOT_ACCOUNT.save()
    .then(root=>{
      return resolve({
        code:201,
        msg:`Initialize root account successfully!`,
        root
      })
    })
    .catch(err=>{
      return reject({
        code:500,
        msg:`Can not save root account with error: ${new Error(err.message)}`
      })
    })
  })
})


