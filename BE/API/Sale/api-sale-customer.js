const router = require('express').Router();
const { authenticateSaleToken } = require("../../../middlewares/sale-middleware");
const Customer = require('../../models/customer-model');
const pageSize = 20;

router.get('/list',authenticateSaleToken,async (req,res)=>{
    let { search, page } = req.query;

    let customers = await Customer.find({
        $or: [
            { "name.firstname": { "$regex": search, "$options": "i" } },
            { "name.lastname": { "$regex": search, "$options": "i" } },
            { "contact.email": { "$regex": search, "$options": "i" } },
            { "contact.phone": { "$regex": search, "$options": "i" } },
        ]
      
    })

        .populate('contracts.lines.root')
        .populate('contracts.lines.parents')
        .sort({ '_id': 1 })
        .select('name.firstname name.lastname contact.phone contact.email status jobs')
        .skip((page - 1) * pageSize)
        .limit(pageSize);

    let count = await Customer.countDocuments({
        $or: [
            { "name.firstname": { "$regex": search, "$options": "i" } },
            { "name.lastname": { "$regex": search, "$options": "i" } },
            { "contact.email": { "$regex": search, "$options": "i" } },
            { "contact.phone": { "$regex": search, "$options": "i" } },
        ]
        
    });

    return res.status(200).json({
        msg: `Load customers list successfully!`,
        customers,
        pages: count % pageSize == 0 ? count / pageSize : Math.floor(count / pageSize) + 1,
        pageSize
    });
   
})

router.get('/detail',(req,res)=>{
    let {id} = req.query;
    Customer
    .findById(id)
    .populate('output')
    .populate('size')
    .populate('color')
    .populate('cloud')
    .populate('nation')
    .exec()
    .then(customer=>{
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
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not get customer detail with error: ${new Error(err.message)}`
        })
    })
})



module.exports = router;