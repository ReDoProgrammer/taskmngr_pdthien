const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const Customer = require('../../models/customer-model');


router.get('/list',authenticateTLAToken,(req,res)=>{
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
    .populate('color_mode','name -_id')
    .populate('cloud','name -_id')
    .populate('national_style','name -_id')
    .exec()
    .then(customers=>{  
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

router.get('/detail',authenticateTLAToken,async (req,res)=>{
    let {customerId} = req.query;
    let customer  = await Customer.findById(customerId)
    .populate([
        {path:'style.output'},
        {path:'style.size'},
        {path:'style.color'},
        {path:'style.cloud'},
        {path:'style.nation'},
        {path:'contracts.lines.root'},
        {path:'contracts.lines.parents'}
    ]);
    if(!customer){
        return res.status(404).json({
            msg:`Customer not found!`
        })
    }
    return res.status(200).json({
        msg:`Get customer detail successfully!`,
        customer
    })
})




module.exports = router;