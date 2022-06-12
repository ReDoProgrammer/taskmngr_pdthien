const router = require("express").Router();
const User = require("../../models/user-model");
const Module = require('../../models/module-model');




const _MODULES = [
  { name: 'ADMIN', description: 'Quản trị viên hệ thống', appling_wage: false },
  { name: 'DC', description: 'Nhân viên kiểm duyệt đầu ra đơn hàng', appling_wage: true },
  { name: 'ACCOUNTANT', description: 'Kế toán', appling_wage: false },
  { name: 'SALE', description: 'Nhân viên kinh doanh', appling_wage: true },
  { name: 'TLA', description: 'Nhân viên điều phối, quản lý công việc', appling_wage: false },
  { name: 'EDITOR', description: 'Nhân viên chỉnh sửa hình ảnh', appling_wage: true },
  { name: 'QA', description: 'Nhân viên kiểm duyệt hình ảnh', appling_wage: true }

]

const _ROOT_ACCOUNT = new User({
  username: 'admin',
  password: 'admin',
  fullname: 'Administrator',
  idNo: '230752538',
  issued_by: 'Gia Lai',
  phone: '0911397764',
  email: 'redo2011dht@gmail.com',
  address: 'Chư Ty - Đức Cơ - Gia Lai'
})

router.get("/", (req, res) => {
  res.render("admin/home/index", {
    layout: "layouts/admin-layout",
    title: "Home",

  });
});

router.get("/init", async (req, res) => {
  await Promise.all([initRootAccount, initModules])
    .then(async rs => {
      console.log(rs)
      let m = rs[1][0];
      let admin = rs[0];
      let chk = m.users.indexOf(admin._id);
      if (chk == -1) {
        m.users.push(admin);
        await m.save()
          .then(_ => {
            return res.status(200).json({
              msg: `Initialize database successfully!`
            })
          })
          .catch(err=>{
            return res.status(500).json({
              msg:`Can not initialize database with error: ${new Error(err.message)}`
            })
          })
      }else{
        return res.status(200).json({
          msg:`Initialize database successfully!`
        })
      }

    })
    .catch(err => {
      return res.status(err.code).json({
        msg: err.msg
      })
    })

});



module.exports = router;




const initModules = new Promise(async (resolve, reject) => {
  try {
    let count = await Module.countDocuments({});
    if (count == 0) {
      Module.insertMany(_MODULES,async (err,modules)=>{
        if(err){
          return reject({
            code:500,
            msg: new Error(err.message)
          })
        }
        return resolve(modules);
      })     
    } else {
      let modules = await Module.find({});
      return resolve(modules);
    }
  } catch (error) {
    return reject({
      code: 500,
      msg: `Can not init module with catched error: ${new Error(error.message)}`
    })
  }

})



const initRootAccount = new Promise(async (resolve, reject) => {
  try {
    let count = await User.countDocuments({});
    if (count == 0) {
      await _ROOT_ACCOUNT.save()
        .then(_ => {
          return resolve(_ROOT_ACCOUNT);
        })
        .catch(err => {
          return reject({
            code: 500,
            msg: new Error(err.message)
          })
        })
    } else {
      let admin = await User.find({})
        .sort({ _id: 1 })
        .limit(1);
      return resolve(admin);
    }
  } catch (error) {
    reject({
      code: 500,
      msg: `Can not init root account with error: ${new Error(error.message)}`
    })
  }
})


