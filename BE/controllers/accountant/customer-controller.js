const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('accountant/customer/index',{
        layout:'layouts/accountant-layout',
        title:'Customer management'
    });
})


router.get('/create',(req,res)=>{
    res.render('accountant/customer/create',{
        layout:'layouts/accountant-layout',
        title:'Add a new customer'       
    })
})


router.get('/update',(req,res)=>{
    res.render('accountant/customer/update',{
        layout:'layouts/accountant-layout',
        title:'Update customer information'
       
    })
})

module.exports = router;