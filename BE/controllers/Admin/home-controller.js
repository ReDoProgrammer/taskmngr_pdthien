const router = require("express").Router();
const User = require("../../models/user-model");

router.get("/", (req, res) => {
  res.render("admin/home/index", {
    layout: "layouts/admin-layout",
    module: "Home",
  });
});

router.get("/init", (req, res) => {
  User.countDocuments((err, docs) => {
    if (err) {
      console.log(`Can not count users with error: ${new Error(err.message)}`);
    }
    if (docs == 0) {
      let admin = new User({
        username: "admin",
        password: "admin",
        fullname: "Administrator",
        idNo: "1234454787",
        phone: "0911397764",
        email: "redo2011dht@gmail.com",
        address: "Đăk Đoa - Đăk Đoa - Gia Lai",
        bank: "BIDV",
        bank_no: "62110000454278",
        bank_name: "Nguyen Huu Truong",
        is_admin: true,
        is_tla: true,
        is_sale: true,
        is_accountant: true,
        is_staff: true,
      });
      admin
        .save()
        .then((user) => {
          console.log("initial root user successfully!");
        })
        .catch((err) => {
          console.log(
            "can not init root user. Error: " + new Error(err.message)
          );
        });
    }
  });
});

router.get("/login", (req, res) => {
  res.render("admin/home/login", {
    layout: "admin/home/login",
  });
});

module.exports = router;
