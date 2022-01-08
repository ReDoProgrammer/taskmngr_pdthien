const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/staff-level/index',{
        layout:'layouts/admin-layout',
        title:'Staff level'
    });
})


module.exports = router;