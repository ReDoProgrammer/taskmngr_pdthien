const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/customer/index',{
        layout:'layouts/admin-layout',
        title:'Customer management'
    });
})


module.exports = router;