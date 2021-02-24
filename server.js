const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const layout = require('express-ejs-layouts');

app.set("view engine", "ejs"); //set view engine cho nodejs
app.set("views", "./FE/views"); //set thư mục view cho project
app.use(express.static("./public"));//set đường dẫn tới thư mục public gồm css,js,bootstrap...

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
const homeController = require("./BE/controllers/FE/home-controller");


//ADMIN CONTROLLERS
const adminAccountController = require('./BE/controllers/BE/account-controller');
const adminConfigController = require("./BE/controllers/BE/config-controller");
const adminCustomerController = require("./BE/controllers/BE/customer-controller");
const adminCustomerStyleController = require("./BE/controllers/BE/customer-style-controller");
const adminHomeController = require('./BE/controllers/BE/home-controller');
const adminStaffController = require("./BE/controllers/BE/staff-controller");


app.use(layout);//set layout

//USING USER CONTROLLERS
app.use('/',homeController);


//USING ADMIN CONTROLLERS

app.use('/admin',adminHomeController);
app.use('/admin/account/login',adminAccountController);
app.use('/admin/config',adminConfigController);
app.use('/admin/customer',adminCustomerController);
app.use('/admin/customer-style',adminCustomerStyleController);
app.use('/admin/staff',adminStaffController);
app.listen(process.env.PORT, (_) => {
  console.log(`server is running on port ${process.env.PORT}`);
});
