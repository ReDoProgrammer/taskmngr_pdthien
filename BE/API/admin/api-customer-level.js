const router = require('express').Router();
const CustomerLevel = require('../../models/customer-level-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");


router.get('/', authenticateAdminToken, (req, res) => {
    let { customerId } = req.query;

    CustomerLevel
        .find({ customer: customerId })
        .populate('level')
        .exec()
        .then(cl => {
            return res.status(200).json({
                msg: 'Load customer levels successfully',
                cl
            })
        })
        .catch(err => {
            console.log(`error found when loading customer levels: ${new Error(err.message)}`);
            return res.status(500).json({
                msg: `Can not load customer levels with error: ${new Error(err.message)}`
            })
        })

})

router.post('/', authenticateAdminToken, (req, res) => {
    let { customerId,
        levelId,
        price } = req.body;
    CustomerLevel.countDocuments({
        customer:customerId,
        level:levelId
    },(err,count)=>{
        if(err){
            return res.status(500).json({
                msg:`Can not count customer level with error: ${new Error(err.message)}`
            })
        }
        if(count > 0){
            return res.status(403).json({
                msg:`This customer level already exist in database!`
            })
        }

        let cl = new CustomerLevel({
            customer:customerId,
            level:levelId,
            price
        })

        cl.save()
        .then(c=>{
            return res.status(201).json({
                msg:`Customer level has been added successfully!`,
                c
            })
        })
        .catch(err=>{
            return res.status(500).json({
                msg:`Can not add new customer level with error: ${new Error(err.message)}`
            })
        })
    })


})


router.delete('/',authenticateAdminToken,(req,res)=>{
    let {id} = req.body;
    console.log(id);

    CustomerLevel.findByIdAndDelete(id,(err,cl)=>{
        if(err){
            return res.status(500).json({
                msg:`Can not delete this customer level with error: ${new Error(err.message)}`
            })
        }

        if(!cl){
            return res.status(404).json({
                msg:`Customer level not found!`
            })
        }

        return res.status(200).json({
            msg:`The customer level has been deleted!`
        })
    })
})

module.exports = router;