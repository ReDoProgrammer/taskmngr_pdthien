const router = require("express").Router();
const User = require("../../models/user-model");
const UserModule = require('../../models/user-module-model');
const Module = require('../../models/module-model');





const modules = [
  { name: 'ADMIN', description: 'Quản trị viên hệ thống', appling_wage: false },
  { name: 'DC', description: 'Nhân viên kiểm duyệt đầu ra đơn hàng', appling_wage: true },
  { name: 'ACCOUNTANT', description: 'Kế toán', appling_wage: false },
  { name: 'SALE', description: 'Nhân viên kinh doanh', appling_wage: true },
  { name: 'TLA', description: 'Nhân viên điều phối, quản lý công việc', appling_wage: false },
  { name: 'EDITOR', description: 'Nhân viên chỉnh sửa hình ảnh', appling_wage: true },
  { name: 'QA', description: 'Nhân viên kiểm duyệt hình ảnh', appling_wage: true }

]

const rootAccount = {
  username:'admin',
  password:'admin',
  fullname:'Administrator',
  idNo:'230752538',
  issued_by:'Gia Lai',
  phone:'0911397764',
  email:'redo2011dht@gmail.com',
  address: 'Chư Ty - Đức Cơ - Gia Lai'
}

router.get("/", (req, res) => {
  res.render("admin/home/index", {
    layout: "layouts/admin-layout",
    title: "Home",

  });
});

router.get("/init", (req, res) => {

  Promise.all([initModule, initRootAccount])
    .then(result => {
      return res.status(200).json({
        msg:`Initialize database successfully!`,
        result
      })
      console.log(reulst);
      // initUserModule(result[1].usr._id, result[0].mods[0]._id)
      //   .then(um => {
      //     return res.status(201).json({
      //       msg: 'Initial administrator account successfully',
      //       um
      //     })
      //   })
      //   .catch(err => {
      //     console.log(`Can not initialize administrator information with error: ${new Error(err.message)}`);
      //     return res.status(500).json({
      //       msg: `Can not init administrator account with error: ${new Error(err.message)}`
      //     })
      //   })
    })
    .catch(err => {
      return res.status(err.code).json({
        msg: `Can not initial administrator account with error: ${new Error(err.message)}`
      })
    })

});




module.exports = router;




function initRootAccount(){

  User.countDocuments({},(err,count)=>{

  })

  rootAccount
  .save()
  .then(admin=>{
    return Promise.resolve({
      code: 201,
      msg:`Initialize root account successfully!`,
      admin
    })
  })
  .catch(err=>{
    return Promise.reject({
      code: 500,
      msg:`Can not initialize root account with error: ${new Error(err.message)}`
    })
  })


}





initModule =new Promise((resolve,reject)=> {
  Module.countDocuments({}, async (err, count) => {
    if (err) {
      return Promise.reject({
        code: 500,
        msg: `Can not initialize with error: ${new Error(err.message)}`
      })
    }

    if (count > 0) {
      return Promise.reject({
        code: 403,
        msg: `These Module already exist in database!`
      })
    }
    const options = { ordered: true };
    try {
      const result = await Module.insertMany(modules, options);
      return Promise.resolve({
        code: 201,
        msg:`Initializw modules successfully!`,
        modules:result
      })
    } catch (error) {
      return Promise.reject({
        code: 500,
        err: new Error(error.message)
      })
    }
  }

  )
})







const initUserModule = (userId, moduleId) => {
  return new Promise((resolve, reject) => {

    UserModule.countDocuments({}, (err, count) => {
      if (err) {
        return reject({
          code: 500,
          msg: `Can not count user module list with error: ${new Error(err.message)}`,
          error: new Error(err.message)
        })
      }

      if (count > 0) {
        return reject({
          code: 403,
          msg: `These Module already exist in db`
        })
      }
      let usermodule = new UserModule();
      usermodule.user = userId;
      usermodule.module = moduleId;

      UserModule.create(usermodule, (err, um) => {
        if (err) {
          console.log(`Can not initialize user module with error: ${new Error(err.message)}`);
          return reject({
            code: 500,
            msg: `Can not initialize user module with error: ${new Error(err.message)}`,
            error: new Error(err.message)
          })
        }
        return resolve({
          code: 201,
          msg: `Initialize user module successfully!`,
          um
        })
      })

    })

  })
}
