const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/level/index',{
        layout:'layouts/admin-layout',
        title:'Level'
    });
})


module.exports = router;