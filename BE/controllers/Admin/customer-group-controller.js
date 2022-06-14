const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/customer-group/index',{
        layout:'layouts/admin-layout',
        title:'Customer group management'
    });
})


module.exports = router;