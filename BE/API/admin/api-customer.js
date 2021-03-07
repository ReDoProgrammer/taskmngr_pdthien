const router = require("express").Router();
const Customer = require("../../models/customer-model");
const { authenticateAdminToken } = require("../../../middlewares/middleware");
require("dotenv").config();

router.delete("/", authenticateAdminToken, (req, res) => {
  let id = req.body.id;
  Customer.findOneAndDelete({ _id: id }, (err, customer) => {
    if (err) {
      return res.status(500).json({
        msg: "Delete customer failed!",
        error: new Error(err.message),
      });
    }

    if (customer) {
      return res.status(200).json({
        msg: "Customer has been deleted!",
      });
    } else {
      return res.status(404).json({
        msg: "Customer not found!",
      });
    }
  });
});

router.get("/list", (req, res) => {
    let {search,page} = req.query;
    
    var lst = Customer.find({$or:[
        {firstname:{ "$regex": search, "$options": "i" }},
        {lastname:{ "$regex": search, "$options": "i" }},
        {phone:{ "$regex": search, "$options": "i" }},
        {email:{ "$regex": search, "$options": "i" }},
    ]})
    .select('firstname','lastname')
    .skip((page-1)*process.env.PAGE_SIZE)
    .limit(process.env.PAGE_SIZE);
    console.log(lst);

});

router.get("/detail", authenticateAdminToken, (req, res) => {
  let { id } = req.query;
  Customer.findById(id, (err, customer) => {
    if (err) {
      return res.status(500).json({
        msg: "Can not get customer detail",
        error: new Error(err.message),
      });
    }
    if (customer) {
      return res.status(200).json({
        msg: "Get customer detail successfully!",
        customer: customer,
      });
    } else {
      return res.status(404).json({
        msg: "Customer not found!",
      });
    }
  });
});

router.post("/", authenticateAdminToken, (req, res) => {
  let {
    firstname,
    lastname,
    username,
    password,
    phone,
    email,
    address,
    output,
    size,
    color_mode,
    is_align,
    align_note,
    cloud,
    national_style,
    style_note,
    has_TV,
    TV_note,
    has_grass,
    grass_note,
    has_sky,
    sky_note,
    has_fire,
    fire_note,
    levels,
  } = req.body;

  if (typeof levels == 'undefined' || levels.length == 0) {
    return res.status(403).json({
      msg: "Level list can not be empty!",
    });
  }
  
  Customer.countDocuments({email},(err,count)=>{
      if(err){
          return res.status(500).json({
              msg:'Can not create a new customer',
              error:new Error(err.message)
          });
      }

      if(count>0){
          return res.status(409).json({
              msg:'Email already exist in database!'
          });
      }else{
        let customer = new Customer({
            firstname,
            lastname,
            username,
            password,
            phone,
            email,
            address,
            output,
            size,
            color_mode,
            is_align,
            align_note,
            cloud,
            national_style,
            style_note,
            has_TV,
            TV_note,
            has_grass,
            grass_note,
            has_sky,
            sky_note,
            has_fire,
            fire_note,
            levels,
          });
          customer
            .save()
            .then((customer) => {
              return res.status(201).json({
                msg: "Customer has been created successfully!",
                customer: customer,
                url:'/admin/customer'
              });
            })
            .catch((err) => {
                console.log(err);
        
              return res.status(500).json({
                msg: "Create new customer failed",
                error: new Error(err.message),
              });
            });
      }
  })

 
});

router.put("/", authenticateAdminToken, (req, res) => {
  let { id, name, description, is_input } = req.body;

  //ràng buộc dữ liệu cho đầu vào tên level
  if (name.length == 0) {
    return res.status(403).json({
      msg: "Vui lòng nhập tên định dạng file",
    });
  }

  Customer.findOneAndUpdate(
    { _id: id },
    {
      name,
      description,
      is_input,
    },
    { new: true },
    (err, ff) => {
      if (err) {
        return res.status(500).json({
          msg: "Cập nhật thông tin định dạng file thất bại!",
          error: new Error(err.message),
        });
      }

      if (ff) {
        return res.status(200).json({
          msg: "Cập nhật thông tin định dạng file thành công!",
          ff: ff,
        });
      } else {
        return res.status(500).json({
          msg: "Cập nhật thông tin định dạng file thất bại!",
        });
      }
    }
  );
});

module.exports = router;
