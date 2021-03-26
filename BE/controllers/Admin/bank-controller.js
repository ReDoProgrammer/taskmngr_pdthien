const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/bank/index',{
        layout:'layouts/admin-layout'
    });
})


module.exports = router;