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
const adminCloudController = require('./BE/controllers/Admin/cloud-controller');
const adminColorModeController = require('./BE/controllers/Admin/color-mode-controller');
const adminStyleController = require("./BE/controllers/Admin/style-controller");
const adminCustomerController = require("./BE/controllers/Admin/customer-controller");
const adminCustomerStyleController = require("./BE/controllers/Admin/customer-style-controller");
const adminFileFormatController = require("./BE/controllers/Admin/file-format-controller");
const adminHomeController = require("./BE/controllers/Admin/home-controller");

const adminLevelController = require("./BE/controllers/Admin/level-controller");
const adminLocalLevelController = require("./BE/controllers/Admin/local-level-controller");

const adminNationalStyleController = require('./BE/controllers/Admin/national-style-controller');
const adminSizeController = require('./BE/controllers/Admin/size-controller');
const adminSkillController = require("./BE/controllers/Admin/skill-controller");
const adminStatusController = require("./BE/controllers/Admin/status-controller");
const adminStaffController = require("./BE/controllers/Admin/staff-controller");
const adminUserGroupController = require('./BE/controllers/Admin/user-group-controller');
const adminUserTypeController = require('./BE/controllers/Admin/user-type-controller');


/*

define sale controllers

*/
const saleHomeController = require('./BE/controllers/Sale/sale-home-controller');
const saleJobController = require('./BE/controllers/Sale/sale-job-controller');


/*

  TLA Controllers

*/

const TLAHomeController = require('./BE/controllers/TLA/home-controller');




//common controllers
const commonAccountController = require("./BE/controllers/common/account-controller");

app.use(layout); //set layout

/**
 * API ADMIN
 * 
 */
const apiAdminCloud = require('./BE/API/admin/api-cloud');
const apiAdminColorMode = require('./BE/API/admin/api-color-mode');
const apiAdminCustomer = require('./BE/API/admin/api-customer');
const apiAdminFileFormat = require('./BE/API/admin/api-file-format');
const apiAdminLevel = require('./BE/API/admin/api-level');
const apiAdminLocalLevel = require('./BE/API/admin/api-local-level');
const apiAdminNationalStyle = require('./BE/API/admin/api-national-style');
const apiAdminSize = require('./BE/API/admin/api-size');
const apiAdminSkill = require('./BE/API/admin/api-skill');
const apiAdminUser = require('./BE/API/admin/api-user');
const apiAdminStatus = require('./BE/API/admin/api-status');
const apiAdminStyle = require('./BE/API/admin/api-style');
const apiAdminUserType = require('./BE/API/admin/api-user-type');


/*
  SALE API CONTROLLERS
*/
const apiSaleCustomer = require('./BE/API/Sale/api-sale-customer');
const apiSaleJob = require('./BE/API/Sale/api-sale-job');


/*
  TLA API CONTROLLERS
*/
const TLAAuth = require('./BE/API/TLA/api-auth');
const apiTLAJob = require('./BE/API/TLA/api-tla-job');


/**
 * USING API
 *
 */
app.use('/admin/account',apiAdminUser);
app.use('/admin/cloud',apiAdminCloud);
app.use('/admin/color-mode',apiAdminColorMode);
app.use('/admin/customer',apiAdminCustomer);
app.use('/admin/file-format',apiAdminFileFormat);
app.use('/admin/level',apiAdminLevel);
app.use('/admin/local-level',apiAdminLocalLevel);
app.use('/admin/national-style',apiAdminNationalStyle);
app.use('/admin/size',apiAdminSize);
app.use('/admin/skill',apiAdminSkill);
app.use('/admin/status',apiAdminStatus);
app.use('/admin/style',apiAdminStyle);
app.use('/admin/user-type',apiAdminUserType);



//USING USER CONTROLLERS
app.use("/", homeController);

//USING ADMIN CONTROLLERS

app.use("/admin", adminHomeController);
app.use("/admin/account/login", adminAccountController);

app.use("/admin/customer", adminCustomerController);
app.use("/admin/customer-style", adminCustomerStyleController);

app.use('/admin/setting/color-mode',adminColorModeController);
app.use('/admin/setting/cloud',adminCloudController);
app.use("/admin/setting/file-format", adminFileFormatController);
app.use("/admin/setting/level", adminLevelController);
app.use("/admin/setting/local-level", adminLocalLevelController);
app.use('/admin/setting/national-style',adminNationalStyleController);
app.use("/admin/setting/size", adminSizeController);
app.use("/admin/setting/status", adminStatusController);
app.use("/admin/setting/style", adminStyleController);
app.use("/admin/setting/skill", adminSkillController);
app.use('/admin/setting/user-group',adminUserGroupController);
app.use('/admin/setting/user-type',adminUserTypeController);


app.use("/admin/staff", adminStaffController);


//using sale controllers
app.use('/sale',saleHomeController);
app.use('/sale/customer',apiSaleCustomer);
app.use('/sale/job',saleJobController);

//using sale api controllers 
app.use('/sale/job',apiSaleJob);


//using TLA Controllers 

app.use('/tla',TLAHomeController);


//using TLA API 
app.use('/tla/auth',TLAAuth);
app.use('/tla/job',apiTLAJob);



//using common controllers
app.use("/account", commonAccountController);

app.listen(process.env.PORT, (_) => {
  console.log(`server is running on port ${process.env.PORT}`);
});
