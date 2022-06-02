const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/material/index',{
        layout:'layouts/admin-layout',
        title: 'Material'
    });
})


module.exports = router;