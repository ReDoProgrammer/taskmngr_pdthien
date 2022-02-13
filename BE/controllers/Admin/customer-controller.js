const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/customer/index',{
        layout:'layouts/admin-layout',
        title:'Customer management'
    });
})


router.get('/create',(req,res)=>{
    res.render('admin/customer/create',{
        layout:'layouts/admin-layout',
        title:'Add a new customer'
       
    })
})


router.get('/update',(req,res)=>{
    res.render('admin/customer/update',{
        layout:'layouts/admin-layout',
        title:'Update customer information'
       
    })
})

module.exports = router;