const router = require("express").Router();
const User = require("../../models/user-model");
const UserModule = require('../../models/user-module-model');
const Module = require('../../models/module-model');


router.get("/", (req, res) => {
  res.render("admin/home/index", {
    layout: "layouts/admin-layout",
    title: "Home",

  });
});

// router.get("/init", (req, res) => {

//   Promise.all([initModule, initAdministrator])
//     .then(result => {     
//       initUserModule(result[1].usr._id, result[0].mods[0]._id)
//         .then(um => {
//           return res.status(201).json({
//             msg: 'Initial administrator account successfully',
//             um
//           })
//         })
//         .catch(err => {
//           console.log(`Can not initialize administrator information with error: ${new Error(err.message)}`);
//           return res.status(500).json({
//             msg: `Can not init administrator account with error: ${new Error(err.message)}`
//           })
//         })
//     })
//     .catch(err => {
//       return res.status(err.code).json({
//         msg: `Can not initial administrator account with error: ${new Error(err.message)}`
//       })
//     })

// });


// const initAdministrator = new Promise(async (resolve, reject) => {

//   let admin =await new User({
//     username: "admin",
//     password: "admin",
//     fullname: "Administrator",
//     idNo: "1234454787",
//     issued_by: "Gia Lai",
//     phone: "0911397764",
//     email: "redo2011dht@gmail.com",
//     address: "Đăk Đoa - Đăk Đoa - Gia Lai",
//     bank: "",
//     bank_no: "62110000454278",
//     bank_name: "Nguyen Huu Truong"

//   });

//   await User.countDocuments({}, async (err, count) => {
//     if (err) {
//       return reject({
//         code: 500,
//         msg: `Can not count user documnet with error: ${new Error(err.message)}`,
//         error: new Error(err.message)
//       })
//     }
//     if (count > 0) {
//       return reject({
//         code:403,
//         msg: `Administrator account already exist in db`
//       })
//     }


//    await User.create(admin, (err, usr) => {
//       if (err) {
//         return reject({
//           code: 500,
//           msg: `Can not initialize administrator account with error: ${new Error(err.message)}`,
//           error: new Error(err.message)
//         })
//       }

//       if(!usr){
//         return reject({
//           code:500,
//           msg:`Can not create administrator account with unknow error`
//         })
//       }

//       return resolve({
//         code:201,
//         msg: `Initialize administrator account successfully!`,
//         usr
//       })
//     })
//   })


// })




// const initModule = new Promise(async (resolve, reject) => {

//   Module.countDocuments({}, async  (err, count) => {
//     if (err) {
//       return reject({
//         code: 500,
//         msg: `Can not count module document with error: ${new Error(err.message)}`,
//         error: new Error(err.message)
//       })
//     }

//     if (count > 0) {
//       return reject({
//         code: 403,
//         msg: `Modules list already exist in db`
//       })
//     }
//     let modules = [
//       { name: 'ADMIN', description: 'Administrator', appling_wage: false },
//       { name: 'SALE', description: 'Quản lý đơn hàng', appling_wage: false },
//       { name: 'TLA', description: 'Quản lý phân luồng công việc', appling_wage: false },
//       { name: 'DC', description: 'Quản lý đầu ra', appling_wage: true },
//       { name: 'EDITOR', description: 'Nhân viên chỉnh sửa ảnh', appling_wage: true },
//       { name: 'QA', description: 'Nhân viên kiểm định', appling_wage: true },
//       { name: 'ACCOUNTANT', description: 'Kế toán', appling_wage: false },
//     ];



//     await Module.insertMany(modules, async (err, mods) => {
//       if (err) {
//         console.log(`Can not initialize modules with error: ${new Error(err.message)}`);
//         return reject({
//           code: 500,
//           msg: `Can not initialize modules with error: ${new Error(err.message)}`,
//           error: new Error(err.message)
//         });
//       }




//       return resolve({
//         code:201,
//         msg: `Inititalize modules successfully!`,
//         mods
//       });
//     })
//   })
// })





// const initUserModule = (userId, moduleId) => {
//   return new Promise((resolve, reject) => {

//     UserModule.countDocuments({},(err,count)=>{
//       if(err){
//         return reject({
//           code:500,
//           msg:`Can not count user module list with error: ${new Error(err.message)}`,
//           error: new Error(err.message)
//         })
//       }

//       if(count>0){
//         return reject({
//           code:403,
//           msg:`These modules already exist in db`
//         })
//       }
//       let usermodule = new UserModule();
//       usermodule.user = userId;
//       usermodule.module = moduleId;
  
//       UserModule.create(usermodule, (err, um) => {
//         if (err) {
//           console.log(`Can not initialize user module with error: ${new Error(err.message)}`);
//           return reject({
//             code: 500,
//             msg: `Can not initialize user module with error: ${new Error(err.message)}`,
//             error: new Error(err.message)
//           })
//         }
//         return resolve({
//           code: 201,
//           msg: `Initialize user module successfully!`,
//           um
//         })
//       })

//     }) 




   
//   })
// }

module.exports = router;
