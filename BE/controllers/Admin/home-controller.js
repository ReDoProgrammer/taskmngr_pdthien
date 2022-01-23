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

router.get("/init", (req, res) => {

  Promise.all([initModule, initAdministrator])
    .then(result => {
    
      initUserModule(result[1]._id,result[0][0]._id)
      .then(um=>{
        return res.status(201).json({
          msg:'Initial administrator account successfully',
          um
        })
      })
      .catch(err=>{
        return res.status(500).json({
          msg:`Can not init administrator account with error: ${new Error(err.message)}`
        })
      })
    })
    .catch(err => {
      return res.status(500).json({
        msg: `Can not initial administrator account with error: ${new Error(err.message)}`
      })
    })



});


const initAdministrator = new Promise((resolve, reject) => {
  let admin = new User({
    username: "admin",
    password: "admin",
    fullname: "Administrator",
    idNo: "1234454787",
    issued_by: "Gia Lai",
    phone: "0911397764",
    email: "redo2011dht@gmail.com",
    address: "Đăk Đoa - Đăk Đoa - Gia Lai",
    bank: "",
    bank_no: "62110000454278",
    bank_name: "Nguyen Huu Truong"

  });
  admin
    .save()
    .then((user) => {
      return resolve(user)
    })
    .catch((err) => {
      return reject({
        error: new Error(err.message)
      })
    });

})

const initModule = new Promise((resolve, reject) => {

  let modules = [
    { name: 'ADMIN', description: 'Administrator',appling_wage:false },
    { name: 'SALE', description: 'Quản lý đơn hàng',appling_wage:false },
    { name: 'TLA', description: 'Quản lý phân luồng công việc',appling_wage:false },
    { name: 'DC', description: 'Quản lý đầu ra',appling_wage:true },
    { name: 'EDITOR', description: 'Nhân viên chỉnh sửa ảnh',appling_wage:true },
    { name: 'QA', description: 'Nhân viên kiểm định',appling_wage:true },
    { name: 'ACCOUNTANT', description: 'Kế toán',appling_wage:false },
  ]
  Module.insertMany(modules)
    .then(mods => {
      return resolve(mods)
    })
    .catch(err => {
      return reject({
        error: new Error(err.message)
      })
    })

})

const initUserModule = (userId, moduleId) => {
  return new Promise((resolve, reject) => {
    let usermodule = new UserModule();
    usermodule.user = userId;
    usermodule.module = moduleId;
    usermodule.save()
      .then(um => {
        return resolve(um)
      })
      .catch(err => {
        return reject({
          error: new Error(err.message)
        })
      })
  })
}

module.exports = router;
