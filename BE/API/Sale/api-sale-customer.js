const router = require('express').Router();
const { TLAMiddleware } = require("../../../middlewares/tla-middleware");
const Customer = require('../../models/customer-model');

router.get('/list',(req,res)=>{
    let {page,search} = req.query;

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
})

router.get('/detail',(req,res)=>{
  let {customerId} = req.query;
  Customer.findById(customerId)
  .populate('cloud','name -_id')
  .select('firstname lastname phone email address -_id')
  .exec()
  .then(customer=>{
    if(customer){
      return res.status(200).json({
        msg:'Get customer detail successfully',
        customer:customer
      })
    }else{
      return res.status(404).json({
        msg:'Can not get customer detail'
      })
    }

  })
  .catch(err=>{
    return res.status(500).json({
      msg:'get customer detail failed',
      error:new Error(err.message)
    })
  })
})


module.exports = router;