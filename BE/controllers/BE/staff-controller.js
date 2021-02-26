const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/staff/index',{
        layout:'layouts/admin-layout'
    });
})


module.exports = router;