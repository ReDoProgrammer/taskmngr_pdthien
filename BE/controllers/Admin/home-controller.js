const router = require("express").Router();
const User = require("../../models/user-model");
const UserModule = require('../../models/user-module-model');
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
  var initRoot = InitRootAccount();
  initRoot.then(result=>{
    console.log(result);
  })
  initRoot.catch(err=>{
    console.log(err);
  })
});






module.exports = router;

const InitRootAccount = new Promise((resolve,reject)=>{
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
      return rejecT({
        code:500,
        msg:`Can not save root account with error: ${new Error(err.message)}`
      })
    })
  })
})


