const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/customer-style/index',{
        layout:'layouts/admin-layout'
    });
})


module.exports = router;