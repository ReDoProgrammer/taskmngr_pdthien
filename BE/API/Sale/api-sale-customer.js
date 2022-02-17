const router = require('express').Router();
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");
const Customer = require('../../models/customer-model');


router.get('/list',authenticateSaleToken,(req,res)=>{
    let {page,search} = req.query;   
    Customer.find({$or:[
        {firstname:{ "$regex": search, "$options": "i" }},
        {lastname:{ "$regex": search, "$options": "i" }},
        {phone:{ "$regex": search, "$options": "i" }},
        {email:{ "$regex": search, "$options": "i" }},
    ]})
    .populate('levels','name -_id')
    .populate('output','name -_id')
    .populate('size','name -_id')
    .populate('color','name -_id')
    .populate('cloud','name -_id')
    .populate('nation','name -_id')
    .exec()
    .then(customers=>{  
        console.log(customers);
        let result = customers.slice(process.env.PAGE_SIZE*(page-1),process.env.PAGE_SIZE);   
        return res.status(200).json({
          msg:'Load customers successfully!',
          pages:customers.length%process.env.PAGE_SIZE==0?customers.length/process.env.PAGE_SIZE:Math.floor(customers.length/process.env.PAGE_SIZE)+1,
          customers:result
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:'Can not load customers list!',
            error: new Error(err.message)
        })
    })
})

router.get('/detail',(req,res)=>{
    let {id} = req.query;
    Customer.findById(id)   
    .exec()
    .then(customer=>{
        return res.status(200).json({
            msg:'Get Customer detail successfully!',
           customer
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:'Can not get customer detail!',
            error: new Error(err.message)
        })
    })
})



module.exports = router;