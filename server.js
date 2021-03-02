const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const layout = require("express-ejs-layouts");
const bodyParser = require("body-parser"); 

app.set("view engine", "ejs"); //set view engine cho nodejs
app.set("views", "./FE/views"); //set thư mục view cho project
app.use(express.static("./public")); //set đường dẫn tới thư mục public gồm css,js,bootstrap...
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(
  process.env.mongoose,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
  () => {
    console.log("connect database successfully");
  },
  (error) => console.log(error.message)
);

//USER CONTROLLERS
const homeController = require("./BE/controllers/TLA/home-controller");

//ADMIN CONTROLLERS
const adminAccountController = require("./BE/controllers/Admin/account-controller");
const adminStyleController = require("./BE/controllers/Admin/style-controller");
const adminCustomerController = require("./BE/controllers/Admin/customer-controller");
const adminCustomerStyleController = require("./BE/controllers/Admin/customer-style-controller");
const adminFileFormatController = require("./BE/controllers/Admin/file-format-controller");
const adminHomeController = require("./BE/controllers/Admin/home-controller");

const adminLevelController = require("./BE/controllers/Admin/level-controller");


const adminSkillController = require("./BE/controllers/Admin/skill-controller");
const adminStatusController = require("./BE/controllers/Admin/status-controller");
const adminStaffController = require("./BE/controllers/Admin/staff-controller");

//common controllers
const commonAccountController = require("./BE/controllers/common/account-controller");

app.use(layout); //set layout

/**
 * API ADMIN
 * 
 */
const apiAdminFileFormat = require('./BE/API/admin/api-file-format');
const apiAdminLevel = require('./BE/API/admin/api-level');
const apiAdminSkill = require('./BE/API/admin/api-skill');
const apiAdminUser = require('./BE/API/admin/api-user');
const apiAdminStatus = require('./BE/API/admin/api-status');
const apiAdminStyle = require('./BE/API/admin/api-style');


/**
 * API CONTROLLERS
 * COMMON
 */
const apiUser = require("./BE/API/common/api-user");
const apiUserGroup = require("./BE/API/common/api-user-group");

/**
 * USING API
 *
 */
app.use('/admin/account',apiAdminUser);
app.use('/admin/file-format',apiAdminFileFormat);
app.use('/admin/level',apiAdminLevel);
app.use('/admin/skill',apiAdminSkill);
app.use('/admin/status',apiAdminStatus);
app.use('/admin/style',apiAdminStyle);





//USING USER CONTROLLERS
app.use("/", homeController);

//USING ADMIN CONTROLLERS

app.use("/admin", adminHomeController);
app.use("/admin/account/login", adminAccountController);

app.use("/admin/customer", adminCustomerController);
app.use("/admin/customer-style", adminCustomerStyleController);

app.use("/admin/setting/file-format", adminFileFormatController);
app.use("/admin/setting/level", adminLevelController);
app.use("/admin/setting/status", adminStatusController);
app.use("/admin/setting/style", adminStyleController);
app.use("/admin/setting/skill", adminSkillController);

app.use("/admin/staff", adminStaffController);

//using common controllers
app.use("/account", commonAccountController);

app.listen(process.env.PORT, (_) => {
  console.log(`server is running on port ${process.env.PORT}`);
});
