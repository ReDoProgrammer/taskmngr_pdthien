const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const layout = require("express-ejs-layouts");
const bodyParser = require("body-parser"); 

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

app.set("view engine", "ejs"); //set view engine cho nodejs
app.set("views", "./FE/views"); //set thư mục view cho project
app.use(express.static("./public")); //set đường dẫn tới thư mục public gồm css,js,bootstrap...
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(layout); //set layout

//accountant zone
const accountantHomeController = require('./BE/controllers/accountant/home-controller');
app.use('/accountant',accountantHomeController);

const accountantJobController = require('./BE/controllers/accountant/job-controller');
app.use('/accountant/job',accountantJobController);

const accountantPayment = require('./BE/controllers/accountant/payment-controller');
app.use('/accountant/payment',accountantPayment);
const accountantTaskController = require('./BE/controllers/accountant/task-controller');
app.use('/accountant/task',accountantTaskController);

const accountantStatisticController = require('./BE/controllers/accountant/statistic-controller');
app.use('/accountant/statistic',accountantStatisticController);



const accountantAuthAPI = require('./BE/API/accountant/authenticate');
app.use('/accountant/auth',accountantAuthAPI);

const accountantCloudAPI = require('./BE/API/accountant/api-cloud');
app.use('/accountant/cloud',accountantCloudAPI);

const accountantColorAPI = require('./BE/API/accountant/api-color-mode');
app.use('/accountant/color-mode',accountantColorAPI);

const accountantCustomerController = require('./BE/controllers/accountant/customer-controller');
app.use('/accountant/customer',accountantCustomerController);

const accountantCustomerAPI = require('./BE/API/accountant/api-customer');
app.use('/accountant/customer',accountantCustomerAPI);

const accountantCustomerLevelAPI = require('./BE/API/accountant/api-customer-level');
app.use('/accountant/customer-level',accountantCustomerLevelAPI);

const accountantFFAPI = require('./BE/API/accountant/api-file-format');
app.use('/accountant/file-format',accountantFFAPI);

const accountantJobAPI = require('./BE/API/accountant/api-job');
app.use('/accountant/job',accountantJobAPI);

const accountantJobLevelAPI = require('./BE/API/accountant/api-job-level');
app.use('/accountant/job-level',accountantJobLevelAPI);

const accountantNationalStyleAPI = require('./BE/API/accountant/api-national-style');
app.use('/accountant/national-style',accountantNationalStyleAPI);



const accountantSizeAPI = require('./BE/API/accountant/api-size');
app.use('/accountant/size',accountantSizeAPI);


const accountantStatisticAPI = require('./BE/API/accountant/api-statistic');
app.use('/accountant/statistic',accountantStatisticAPI);

const accountantTaskAPI = require('./BE/API/accountant/api-task');
app.use('/accountant/task',accountantTaskAPI);


//DC zone
const dcHomeController = require('./BE/controllers/dc/home-controller');
app.use('/dc',dcHomeController);



const dcTaskController = require('./BE/controllers/dc/task-controller');
app.use('/dc/task',dcTaskController);


const dcAuthAPI = require('./BE/API/dc/authenticate');
app.use('/dc/auth',dcAuthAPI);

const dcBonusPenaltyAPI = require('./BE/API/dc/api-bonus-penalty');
app.use('/dc/bonus-penalty',dcBonusPenaltyAPI);

const dcTaskAPI = require('./BE/API/dc/api-task');
app.use('/dc/task',dcTaskAPI);


//Q.A CONTROLLERS
const qaAuthController = require('./BE/API/qa/authenticate');
app.use('/qa/auth',qaAuthController);

const qaTaskController = require('./BE/controllers/qa/task-controller');
app.use('/qa/task',qaTaskController);

const qaTaskApi = require('./BE/API/qa/api-task');
app.use('/qa/task',qaTaskApi);

const qaHomeController = require('./BE/controllers/qa/home-controller');
app.use('/qa',qaHomeController);


// //EDITOR CONTROLLERS
const editorAuthController = require('./BE/API/editor/authenticate');
app.use('/editor/auth',editorAuthController);

const editorTaskController = require('./BE/controllers/editor/task-controller');
app.use('/editor/task',editorTaskController);

const editorHomeController = require("./BE/controllers/editor/home-controller");
app.use("/editor", editorHomeController);

const editorQueueAPI = require('./BE/API/editor/api-queue');
app.use('/editor/queue',editorQueueAPI);


const editorTaskAPI = require('./BE/API/editor/api-task');
app.use('/editor/task',editorTaskAPI);

//ADMIN CONTROLLERS
const adminAccountController = require("./BE/controllers/Admin/account-controller");
const adminBankController = require('./BE/controllers/Admin/bank-controller');
const adminCloudController = require('./BE/controllers/Admin/cloud-controller');
const adminColorModeController = require('./BE/controllers/Admin/color-mode-controller');
const adminComboController = require('./BE/controllers/Admin/combo-controller');
const adminStyleController = require("./BE/controllers/Admin/style-controller");
const adminCustomerController = require("./BE/controllers/Admin/customer-controller");
const adminCustomerStyleController = require("./BE/controllers/Admin/customer-style-controller");
const adminFileFormatController = require("./BE/controllers/Admin/file-format-controller");
const adminHomeController = require("./BE/controllers/Admin/home-controller");

const adminJobLevelController = require('./BE/controllers/Admin/job-leve-controller');

const adminLevelController = require("./BE/controllers/Admin/level-controller");
const adminModuleController = require('./BE/controllers/Admin/module-controller');
const adminBonusPenaltyController = require('./BE/controllers/Admin/bonus-penalty-controller');
const adminStaffLevelController = require("./BE/controllers/Admin/staff-level-controller");

const adminNationalStyleController = require('./BE/controllers/Admin/national-style-controller');
const adminSizeController = require('./BE/controllers/Admin/size-controller');
const adminStatusController = require("./BE/controllers/Admin/status-controller");
const adminStaffController = require("./BE/controllers/Admin/staff-controller");
const adminUserGroupController = require('./BE/controllers/Admin/user-group-controller');


// // /*

// // define sale controllers

// // */
const saleAuthController = require('./BE/controllers/Sale/sale-authenticate-controller');
app.use('/sale',saleAuthController);


const saleHomeController = require('./BE/controllers/Sale/sale-home-controller');










// /**
//  * API ADMIN
//  * 
//  */
const apiAdminBank = require('./BE/API/admin/api-bank');
const apiAdminCloud = require('./BE/API/admin/api-cloud');
const apiAdminColorMode = require('./BE/API/admin/api-color-mode');
const apiCombo = require('./BE/API/admin/api-combo');
const apiComboLine = require('./BE/API/admin/api-combo-line');
const apiAdminCustomer = require('./BE/API/admin/api-customer');
const apiAdminCustomerLevel = require('./BE/API/admin/api-customer-level');
const apiAdminFileFormat = require('./BE/API/admin/api-file-format');
const apiAdminJobLevel = require('./BE/API/admin/api-job-level');
const apiAdminStaffLevel = require('./BE/API/admin/api-staff-level');
const apiAdminStaffJobLevel = require('./BE/API/admin/api-staff-job-level');
const apiAdminModule = require('./BE/API/admin/api-module');
const apiAdminNationalStyle = require('./BE/API/admin/api-national-style');
const apiAdminBonusPenalty = require('./BE/API/admin/api-bonus-penalty');
const apiAdminSize = require('./BE/API/admin/api-size');
const apiAdminUser = require('./BE/API/admin/api-user');
const apiAdminStatus = require('./BE/API/admin/api-status');
const apiAdminStyle = require('./BE/API/admin/api-style');
const apiAdminUserGroup = require('./BE/API/admin/api-user-group');
const apiAdminUserGroupWage = require('./BE/API/admin/api-user-group-wage');
const apiAdminUserModuleRole = require('./BE/API/admin/api-user-module');





// /*
//   SALE CONTROLLERS
// */

const saleCustomerController = require('./BE/controllers/Sale/sale-customer-controller');
app.use('/sale/customer',saleCustomerController);


const saleJobController = require('./BE/controllers/Sale/sale-job-controller');
app.use('/sale/job',saleJobController);


const saleTaskController = require('./BE/controllers/Sale/sale-task-controller');
app.use('/sale/task',saleTaskController);


// // /*
// //   SALE API 
// // */
const apiSaleAuth = require('./BE/API/Sale/api-auth');
app.use('/sale/auth',apiSaleAuth);

const apiSaleCombo = require('./BE/API/Sale/api-sale-combo');
app.use('/sale/combo',apiSaleCombo);

const apiSaleCustomer = require('./BE/API/Sale/api-sale-customer');
app.use('/sale/customer',apiSaleCustomer);

const apiSaleJob = require('./BE/API/Sale/api-sale-job');
app.use('/sale/job',apiSaleJob);


const apiSaleTask = require('./BE/API/Sale/api-sale-task');
app.use('/sale/task',apiSaleTask);

// // /*
// //   TLA Controllers
// // */


const TLAAuth = require('./BE/controllers/TLA/authentication-controller');
app.use('/tla',TLAAuth);

const TLAHomeController = require('./BE/controllers/TLA/home-controller');
app.use('/tla',TLAHomeController);

const TLAJobController = require('./BE/controllers/TLA/job-controller');
app.use('/tla/job',TLAJobController);

const TLATaskController = require('./BE/controllers/TLA/task-controller');
app.use('/tla/task',TLATaskController);


// // /*
// //   TLA API CONTROLLERS
// // */

const apiTLAAuth = require('./BE/API/TLA/api-auth');
app.use('/tla/auth',apiTLAAuth);

const apiTLABonusPenaltyLine = require('./BE/API/TLA/api-bonus-penalty-line');
app.use('/tla/bonus-penalty-line',apiTLABonusPenaltyLine);

const apiTLAComboLine = require('./BE/API/TLA/api-tla-combo-line');
app.use('/tla/combo-line',apiTLAComboLine);

const apiTLACustomer = require('./BE/API/TLA/api-tla-customer');
app.use('/tla/customer',apiTLACustomer);

const apiTLAJob = require('./BE/API/TLA/api-tla-job');
app.use('/tla/job',apiTLAJob);

const apiTLAJobLevel = require('./BE/API/TLA/api-job-level');
app.use('/tla/job-level',apiTLAJobLevel);

const apiTLALevel = require('./BE/API/TLA/api-tla-level');
app.use('/tla/level',apiTLALevel);

const apiTLAQueue = require('./BE/API/TLA/api-queue');
app.use('/tla/queue',apiTLAQueue);

const apiTLATask = require('./BE/API/TLA/api-tla-task');
app.use('/tla/task',apiTLATask);


const apiTLAUser = require('./BE/API/TLA/api-tla-user');
app.use('/tla/user',apiTLAUser);


// /**
//  * USING API
//  *
//  */
app.use('/admin/bank',apiAdminBank);//quản lý thông tin danh sách ngân hàng
app.use('/admin/user',apiAdminUser);//quản lý thông tin nhân viên
app.use('/admin/cloud',apiAdminCloud);//quản lý thông tin cloud để upload link file của khách
app.use('/admin/color-mode',apiAdminColorMode);//quảnlý hệ màu của hình ảnh
app.use('/admin/combo',apiCombo);//quan ly combo
app.use('/admin/combo-line',apiComboLine);//quan ly comboline
app.use('/admin/customer',apiAdminCustomer);//quản lý thông tin khách hàng
app.use('/admin/customer-level',apiAdminCustomerLevel);//quản lý thông tin các level mặt hàng của khách, liên quan tới thông tin hợp đồng của từng khách hàng
app.use('/admin/file-format',apiAdminFileFormat);//quản lý thông tin định dạng file hình ảnh xuất cho khách
app.use('/admin/job-level',apiAdminJobLevel);//quản lý thông tin danh sách level, khác với apiAdminCustomerLevel
app.use('/admin/bonus-penalty',apiAdminBonusPenalty);//quản lý các hình thức phạt đối với nhân viên
app.use('/admin/module',apiAdminModule);// quản lý danh sách module của web
app.use('/admin/national-style',apiAdminNationalStyle);//quản lý thông tin style của khách hàng theo quốc gia
app.use('/admin/size',apiAdminSize);//quản lý thông tin kích thước file hình ảnh 
app.use('/admin/staff-level',apiAdminStaffLevel);//quản lý level của nhân viên, phân loại nhân viên: người mới, tập sự, học việc,...
app.use('/admin/staff-job-level',apiAdminStaffJobLevel);//quản lý level của nhân viên tuơng ứng với các job level có thể làm
app.use('/admin/status',apiAdminStatus);//trạng thái của đơn hàng, tạm thời không sử dụng tới
app.use('/admin/style',apiAdminStyle);//style này tạm thời chưa sử dụng tới
app.use('/admin/user-group',apiAdminUserGroup);//quản lý nhóm nhân viên: người nhà, người dưng,....
app.use('/admin/user-group-wage',apiAdminUserGroupWage);//quản lý tiền công của từng nhóm nhân viên dựa theo kĩ năng làm việc: editor, Q.A
app.use('/admin/user-module',apiAdminUserModuleRole);//quản lý quyền truy cập module của từng user





// //USING ADMIN CONTROLLERS

app.use("/admin", adminHomeController);
app.use("/admin", adminAccountController);

app.use("/admin/customer", adminCustomerController);
app.use("/admin/customer-style", adminCustomerStyleController);



app.use('/admin/setting/bank',adminBankController);
app.use('/admin/setting/color-mode',adminColorModeController);
app.use('/admin/setting/cloud',adminCloudController);
app.use('/admin/setting/combo',adminComboController);
app.use("/admin/setting/file-format", adminFileFormatController);
app.use('/admin/setting/job-level',adminJobLevelController);
app.use("/admin/setting/level", adminLevelController);
app.use('/admin/setting/module',adminModuleController);
app.use('/admin/setting/national-style',adminNationalStyleController);
app.use('/admin/setting/bonus-penalty',adminBonusPenaltyController);
app.use("/admin/setting/size", adminSizeController);
app.use("/admin/setting/status", adminStatusController);
app.use("/admin/setting/style", adminStyleController);


app.use('/admin/setting/user-group',adminUserGroupController);


app.use("/admin/staff", adminStaffController);
app.use("/admin/setting/staff-level", adminStaffLevelController);






app.use('/sale',saleHomeController);
app.use('/sale/customer',apiSaleCustomer);







app.listen(process.env.PORT, (_) => {
  console.log(`server is running on port ${process.env.PORT}`);
});
