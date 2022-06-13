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
const homeController = require('./BE/controllers/home/home-controller');
app.use('/',homeController);


const customerHomeController = require('./BE/controllers/customer/home-controller');
app.use('/customer',customerHomeController);

const customerJobController = require('./BE/controllers/customer/job-controller');
app.use('/customer/job',customerJobController);

const customerAuthAPI = require('./BE/API/customer/api-account');
app.use('/customer/account',customerAuthAPI);

const customerJobAPI = require('./BE/API/customer/api-job');
app.use('/customer/job',customerJobAPI);

const customerTaskAPI = require('./BE/API/customer/api-task');
app.use('/customer/task',customerTaskAPI);



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


const accountantFFAPI = require('./BE/API/accountant/api-file-format');
app.use('/accountant/file-format',accountantFFAPI);

const accountantJobAPI = require('./BE/API/accountant/api-job');
app.use('/accountant/job',accountantJobAPI);

const accountantJobLevelAPI = require('./BE/API/accountant/api-job-level');
app.use('/accountant/job-level',accountantJobLevelAPI);

const accountantNationalStyleAPI = require('./BE/API/accountant/api-national-style');
app.use('/accountant/national-style',accountantNationalStyleAPI);

const accountantParentsLevelAPI = require('./BE/API/accountant/api-parents-level');
app.use('/accountant/parents-level',accountantParentsLevelAPI);

const accountantRootLevelAPI = require('./BE/API/accountant/api-root-level');
app.use('/accountant/root-level',accountantRootLevelAPI);

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




const editorTaskAPI = require('./BE/API/editor/api-task');
app.use('/editor/task',editorTaskAPI);

//ADMIN CONTROLLERS
const adminAccountController = require("./BE/controllers/Admin/account-controller");
const adminBankController = require('./BE/controllers/Admin/bank-controller');
const adminBonusPenaltyController = require('./BE/controllers/Admin/bonus-penalty-controller');
const adminCloudController = require('./BE/controllers/Admin/cloud-controller');
const adminColorModeController = require('./BE/controllers/Admin/color-mode-controller');
const adminComboController = require('./BE/controllers/Admin/combo-controller');
const adminCustomerController = require("./BE/controllers/Admin/customer-controller");
const adminCustomerStyleController = require("./BE/controllers/Admin/customer-style-controller");
const adminFileFormatController = require("./BE/controllers/Admin/file-format-controller");
const adminHomeController = require("./BE/controllers/Admin/home-controller");
const adminJobLevelController = require('./BE/controllers/Admin/job-leve-controller');
const adminLevelController = require("./BE/controllers/Admin/level-controller");
const adminMappingController = require('./BE/controllers/Admin/mapping-controller');
const adminMaterialController = require('./BE/controllers/Admin/material-controller');
const adminModuleController = require('./BE/controllers/Admin/module-controller');
const adminNationalStyleController = require('./BE/controllers/Admin/national-style-controller');
const adminParentsLevelController = require('./BE/controllers/Admin/parents-level-controller');
const adminStaffLevelController = require("./BE/controllers/Admin/staff-level-controller");
const adminSizeController = require('./BE/controllers/Admin/size-controller');
const adminStatusController = require("./BE/controllers/Admin/status-controller");
const adminStaffController = require("./BE/controllers/Admin/staff-controller");
const adminStyleController = require("./BE/controllers/Admin/style-controller");
const adminTemplateController = require('./BE/controllers/Admin/template-controller');
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
const apiAdminBonusPenalty = require('./BE/API/admin/api-bonus-penalty');
const apiAdminCloud = require('./BE/API/admin/api-cloud');
const apiAdminColorMode = require('./BE/API/admin/api-color-mode');
const apiCombo = require('./BE/API/admin/api-combo');
const apiAdminCustomer = require('./BE/API/admin/api-customer');
const apiAdminFileFormat = require('./BE/API/admin/api-file-format');
const apiAdminJobLevel = require('./BE/API/admin/api-job-level');
const apiMaterial = require('./BE/API/admin/api-material');
const apiAdminModule = require('./BE/API/admin/api-module');
const apiAdminNationalStyle = require('./BE/API/admin/api-national-style');
const apiAdminParentsLevel  = require('./BE/API/admin/api-parents');
const apiAdminRootLevel = require('./BE/API/admin/api-root-level');
const apiAdminSize = require('./BE/API/admin/api-size');
const apiAdminStaffLevel = require('./BE/API/admin/api-staff-level');
const apiAdminStatus = require('./BE/API/admin/api-status');
const apiAdminStyle = require('./BE/API/admin/api-style');
const apiAdminTemplate = require('./BE/API/admin/api-template');
const apiAdminUserGroup = require('./BE/API/admin/api-user-group');
const apiAdminUser = require('./BE/API/admin/api-user');




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

const apiSaleCC = require('./BE/API/Sale/api-cc');
app.use('/sale/cc',apiSaleCC);

const apiSaleCombo = require('./BE/API/Sale/api-sale-combo');
app.use('/sale/combo',apiSaleCombo);

const apiSaleCustomer = require('./BE/API/Sale/api-sale-customer');
app.use('/sale/customer',apiSaleCustomer);

const apiSaleJob = require('./BE/API/Sale/api-sale-job');
app.use('/sale/job',apiSaleJob);


const apiSaleMaterial = require('./BE/API/Sale/api-material');
app.use('/sale/material',apiSaleMaterial);


const apiSaleTask = require('./BE/API/Sale/api-sale-task');
app.use('/sale/task',apiSaleTask);

const apiSaleTemplate = require('./BE/API/Sale/api-template');
app.use('/sale/template',apiSaleTemplate);

const apiSaleUser = require('./BE/API/Sale/api-user');
app.use('/sale/user',apiSaleUser);

// // /*
// //   TLA Controllers
// // */


const TLAAuth = require('./BE/controllers/TLA/authentication-controller');
app.use('/tla',TLAAuth);

const TLACheckInController = require('./BE/controllers/TLA/checkin-controller');
app.use('/tla/checkin',TLACheckInController);

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

const apiTLACC = require('./BE/API/TLA/api-cc');
app.use('/tla/cc',apiTLACC);




const apiTLACheckIn = require('./BE/API/TLA/api-checkin');
app.use('/tla/checkin',apiTLACheckIn);

const apiTLACustomer = require('./BE/API/TLA/api-tla-customer');
app.use('/tla/customer',apiTLACustomer);

const apiTLAJob = require('./BE/API/TLA/api-tla-job');
app.use('/tla/job',apiTLAJob);



const apiTLALevel = require('./BE/API/TLA/api-tla-level');
app.use('/tla/level',apiTLALevel);


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

app.use('/admin/customer',apiAdminCustomer);//quản lý thông tin khách hàng
app.use('/admin/file-format',apiAdminFileFormat);//quản lý thông tin định dạng file hình ảnh xuất cho khách
app.use('/admin/job-level',apiAdminJobLevel);//quản lý thông tin danh sách level, khác với apiAdminCustomerLevel
app.use('/admin/bonus-penalty',apiAdminBonusPenalty);//quản lý các hình thức phạt đối với nhân viên
app.use('/admin/material',apiMaterial);//quan ly don gia hinh anh dau vao duoc chup boi sale
app.use('/admin/module',apiAdminModule);// quản lý danh sách module của web
app.use('/admin/national-style',apiAdminNationalStyle);//quản lý thông tin style của khách hàng theo quốc gia
app.use('/admin/parents-level',apiAdminParentsLevel);
app.use('/admin/root-level',apiAdminRootLevel);
app.use('/admin/size',apiAdminSize);//quản lý thông tin kích thước file hình ảnh 
app.use('/admin/staff-level',apiAdminStaffLevel);//quản lý level của nhân viên, phân loại nhân viên: người mới, tập sự, học việc,...
app.use('/admin/status',apiAdminStatus);//trạng thái của đơn hàng, tạm thời không sử dụng tới
app.use('/admin/style',apiAdminStyle);//style này tạm thời chưa sử dụng tới
app.use('/admin/template',apiAdminTemplate);
app.use('/admin/user-group',apiAdminUserGroup);//quản lý nhóm nhân viên: người nhà, người dưng,....






// //USING ADMIN CONTROLLERS

app.use("/admin", adminHomeController);
app.use("/admin", adminAccountController);

app.use("/admin/customer", adminCustomerController);
app.use("/admin/customer-style", adminCustomerStyleController);



app.use('/admin/setting/bank',adminBankController);
app.use('/admin/setting/bonus-penalty',adminBonusPenaltyController);
app.use('/admin/setting/color-mode',adminColorModeController);
app.use('/admin/setting/cloud',adminCloudController);
app.use('/admin/setting/combo',adminComboController);
app.use("/admin/setting/file-format", adminFileFormatController);
app.use('/admin/setting/job-level',adminJobLevelController);
app.use("/admin/setting/level", adminLevelController);
app.use('/admin/setting/mapping',adminMappingController);
app.use('/admin/setting/material',adminMaterialController);
app.use('/admin/setting/module',adminModuleController);
app.use('/admin/setting/national-style',adminNationalStyleController);
app.use('/admin/setting/parents-level',adminParentsLevelController);
app.use("/admin/setting/size", adminSizeController);
app.use("/admin/setting/status", adminStatusController);
app.use("/admin/setting/style", adminStyleController);
app.use('/admin/setting/template',adminTemplateController);
app.use('/admin/setting/user-group',adminUserGroupController);
app.use("/admin/staff", adminStaffController);
app.use("/admin/setting/staff-level", adminStaffLevelController);






app.use('/sale',saleHomeController);
app.use('/sale/customer',apiSaleCustomer);







app.listen(process.env.PORT, (_) => {
  console.log(`server is running on port ${process.env.PORT}`);
});
