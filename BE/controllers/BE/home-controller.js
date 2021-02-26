const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/home/index',{
        layout:'layouts/admin-layout',
        module:'Home'
    });
})


module.exports = router;