const router = require("express").Router();
const UserGroup = require("../../models/user-group-model");
const User = require("../../models/user-model");
const Module = require("../../models/module-model");
const Role = require("../../models/role-model");
const ModuleRole = require("../../models/module-role-model");
router.get("/", (req, res) => {
  res.render("admin/home/index", {
    layout: "layouts/admin-layout",
    module: "Home",
  });
});

router.get("/init", (req, res) => {
  userGroupInitPromise
    .then((group) => {
      Promise.all([moduleInitPromise, roleInitPromise, adminInitPromise(group)])
        .then(result=>{
            moduleRoleInitPromise(result[0],result[1],group)
            .then(result=>{
                console.log(result);
            })
            .catch(err=>console.log(err))
        })
        .catch(err=>console.log(err));
    })
    .catch((error) => console.log(error));
});

let userGroupInitPromise = new Promise((resolve, reject) => {
  UserGroup.countDocuments({}, function (err, count) {
    if (err) {
      console.log("count user group failed" + new Error(err.message));
    } else {
      if (count == 0) {
        let adminGroup = new UserGroup({ name: "Admin" });
        adminGroup.save(function (err, group) {
          if (err) {
            return reject(
              `init root user group failed ${new Error(err.message)}`
            );
          }
          return resolve(group);
        });
      }
    }
  });
});

let adminInitPromise = (group_id) => {
  return new Promise((resolve, reject) => {
    let admin = new User({
      username: "admin",
      password: "admin",
      fullname: "Nguyễn Hữu Trường",
      phone: "0911397764",
      email: "redo2011dht@gmail.com",
      idNo: "230752538",
      address: "07 - Trần Quý Cáp - Đăk Đoa - Đăk Đoa - Gia Lai",
      group: group_id,
    });
    admin.save((err, user) => {
      if (err) {
        return reject(`Init admin account failed: ${new Error(err.message)}`);
      }
      return resolve(user);
    });
  });
};

moduleInitPromise = new Promise((resolve, reject) => {
  let modules = [
    { name: "ADMIN_HOME", description: "Trang chủ của admin" },
    { name: "CUSTOMER", description: "Khách hàng" },
    { name: "CUSTOMER STYLE", description: "Style của khách" },
    { name: "STAFF", description: "Nhân viên" },
    { name: "STAFF GROUP", description: "Nhóm nhân viên" },
    { name: "STYLE", description: "Style" },
    { name: "SKILL", description: "Kỹ năng của nhân viên" },
    { name: "STATUS", description: "Trạng thái của line hàng" },
    { name: "INPUT FILE FORMAT", description: "Định dạng dữ liệu đầu vào" },
    { name: "OUTPUT FILE FORMAT", description: "Định dạng dữ liệu đầu ra" },
    { name: "LEVEL", description: "Phân loại hàng" },
    { name: "LEVEL LIST", description: "Style theo quốc gia" },
  ];
  Module.insertMany(modules, (err, mdls) => {
    if (err) {
      return reject(`init modules failed ${new Error(err.message)}`);
    }
    return resolve(mdls);
  });
});

roleInitPromise = new Promise((resolve, reject) => {
  let roles = [
    { name: "Create", description: "Quyền thêm mới" },
    { name: "Read", description: "Quyền xem dữ liệu" },
    { name: "Update", description: "Quyền chỉnh sửa" },
    { name: "Delete", description: "Quyền xóa dữ liệu" },
  ];

  Role.insertMany(roles, (err, roles) => {
    if (err) {
      return reject(`init roles failed: ${new Error(err.message)}`);
    }
    return resolve(roles);
  });
});

let moduleRoleInitPromise = (modules, roles, group) => {
  return new Promise(async (resolve, reject) => {
    modules.forEach(module=>{
        roles.forEach(async role=>{
            try {
              let mr =await new ModuleRole({
                module: module._id,
                role: role._id,
                group: group._id,
                status:true
              });
              await mr.save();
            } catch (error) {
                return reject(`Init module role into group failed: ${new Error(error.message)}`);
            }
        });
    });
    return resolve('every thing is done!')
  });
};

router.get("/login", (req, res) => {
  res.render("admin/home/login", {
    layout: "admin/home/login",
  });
});

module.exports = router;
