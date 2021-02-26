const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/customer/index',{
        layout:'layouts/admin-layout'
    });
})


router.get('/create',(req,res)=>{
    res.render('admin/customer/create',{
        layout:'layouts/admin-layout'
    })
})

module.exports = router;