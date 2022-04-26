const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const CheckIn = require('../../models/staff-checkin');

router.post('/',authenticateTLAToken,(req,res)=>{
    let {staffs} = req.body;

    staffs.each(st=>{
        console.log(st)
    })
})


module.exports = router;