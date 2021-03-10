const router = require("express").Router();
const Customer = require("../../models/customer-model");
const CustomerLevel = require('../../models/customer-level-model');
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
    
   Customer.find({$or:[
        {firstname:{ "$regex": search, "$options": "i" }},
        {lastname:{ "$regex": search, "$options": "i" }},
        {phone:{ "$regex": search, "$options": "i" }},
        {email:{ "$regex": search, "$options": "i" }},
    ]})
    .select('firstname lastname phone email address')    
    .exec((err,customers)=>{
      if(err){
        return res.status(500).json({
          msg:'Load customers failed',
          error:new Error(err.message)
        });
      }
      if(customers){
        let result = customers.slice(process.env.PAGE_SIZE*(page-1),process.env.PAGE_SIZE);   
        return res.status(200).json({
          msg:'Load customers successfully!',
          pages:customers.length%process.env.PAGE_SIZE==0?customers.length/process.env.PAGE_SIZE:Math.floor(customers.length/process.env.PAGE_SIZE)+1,
          result:result
        })
      }else{
        return res.status(500).json({
          error:'Can not load customers!'
        });
      }
    });

  

});

router.get("/detail", authenticateAdminToken, (req, res) => {
  let { customerId } = req.query;
  Customer.findById(customerId) 
  .populate('output','name')
  .populate('size','name')
  .populate('color_mode','name')
  .populate('cloud','name')
  .populate('national_style','name')
  .exec((err,customer)=> {
    if (err) {
      console.log(err);
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
    local_storage,
    cloud_storage,
    output,
    size,
    color_mode,
    is_align,
    align_note,
    cloud,
    national_style,
    remark,
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
            local_storage,
            cloud_storage,
            output,
            size,
            color_mode,
            is_align,
            align_note,
            cloud,
            national_style,
            remark,
            has_TV,
            TV_note,
            has_grass,
            grass_note,
            has_sky,
            sky_note,
            has_fire,
            fire_note          
          });         

          customer
            .save()
            .then((customer) => {
              insert_levels(levels,customer)
              .then(customer=>{
                return res.status(201).json({
                  msg:'Insert customer succesfully!',
                  customer:customer,
                  url:'/admin/customer'
                })
              })
              .catch(err=>{
                return res.status(500).json({
                  msg:'Insert customer failed',
                  error: new Error(err.message)
                })
              })
            })
            .catch((err) => {        
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

var insert_levels = (levels,customerId)=> {
  return new Promise(async (resolve,reject)=>{
    let is_ok = true;
    let error = null;
    await levels.forEach(async level=>{
      let cl = await new CustomerLevel({
        customer:customerId,
        level:level.id,
        price:level.price
      })
      cl.save()
      .then(x=>{
        console.log(x);
      })      
      .catch(err=>{
        is_ok = false;
        error = err;
      })
    })

    if(is_ok){
      return resolve('insert levels successfully');
    }else{
      return reject({
        error: new Error(error)
      })
    }
  })
}

module.exports = router;
