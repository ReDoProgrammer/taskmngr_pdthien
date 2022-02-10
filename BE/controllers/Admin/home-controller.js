const router = require("express").Router();
const User = require("../../models/user-model");
const UserModule = require('../../models/user-module-model');
const Module = require('../../models/module-model');




const modules = [
  { name: 'ADMIN', description: 'Quản trị viên hệ thống', appling_wage: false },
  { name: 'DC', description: 'DC', appling_wage: true },
  { name: 'ACCOUNTANT', description: 'Kế toán', appling_wage: false },
  { name: 'SALE', description: 'Nhân viên kinh doan', appling_wage: true },
  { name: 'TLA', description: 'Nhân viên điều phối, quản lý công việc', appling_wage: false },
  { name: 'EDITOR', description: 'Nhân viên chỉnh sửa hình ảnh', appling_wage: true },
  { name: 'QA', description: 'Nhân viên kiểm duyệt hình ảnh', appling_wage: true }

]




router.get("/", (req, res) => {
  res.render("admin/home/index", {
    layout: "layouts/admin-layout",
    title: "Home",

  });
});

router.get("/init", (req, res) => {

  Promise.all([initModule, initAdministrator])
    .then(result => {
      initUserModule(result[1].usr._id, result[0].mods[0]._id)
        .then(um => {
          return res.status(201).json({
            msg: 'Initial administrator account successfully',
            um
          })
        })
        .catch(err => {
          console.log(`Can not initialize administrator information with error: ${new Error(err.message)}`);
          return res.status(500).json({
            msg: `Can not init administrator account with error: ${new Error(err.message)}`
          })
        })
    })
    .catch(err => {
      return res.status(err.code).json({
        msg: `Can not initial administrator account with error: ${new Error(err.message)}`
      })
    })

});




module.exports = router;




const initAdministrator = new Promise(async (resolve, reject) => {




})

const checkModule = new Promise(async (resolve, reject) => {
 await Module.countDocuments({}) 
  .exec()
  .then(count=>{
    return resolve(count==0);
  })
  .catch(err=>{
    return reject({
      code: 500,
      msg:`Can not count modules document with error: ${new Error(err.message)}`
    })
  })
  
})



const initModule = new Promise((resolve, reject) => {

  checkModule
    .then(chk => {
      console.log(chk);
     
    })
    .catch(err => {
      return reject({
        code: err.code,
        msg: err.msg
      })
    })

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
          msg: `These modules already exist in db`
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
