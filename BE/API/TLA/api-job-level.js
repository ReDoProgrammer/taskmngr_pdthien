const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const JobLevel = require('../../models/job-level-model');


router.get('/', authenticateTLAToken, (req, res) => {
    let { customerId } = req.query;

    //lấy các thông tin level liên quan tới hợp đồng của khách hàng
    //được lưu trữ trong CustomerLevel & có giá lớn hơn 0
    CustomerLevel
        .find({ customer: customerId,  price: {$gt:0}})
        .exec()
        .then(cl => {
            let levels = cl.map(x=>{
               
                return x.level;
            });
           
            JobLevel
                .find({_id:{$in:levels}})
                .exec()
                .then(jl => {
                    return res.status(200).json({
                        msg: 'Load job level list successfully!',
                        jl
                    })
                })
                .catch(err => {
                    return res.status(500).json({
                        msg: 'Load job levels list failed!',
                        error: new Error(err.message)
                    })
                })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not get Customer level with error: ${new Error(err.message)}`
            })
        })


})




module.exports = router;