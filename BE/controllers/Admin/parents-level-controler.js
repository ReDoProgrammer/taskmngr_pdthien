const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/parents-level/index',{
        layout:'layouts/admin-layout',
        title:'Customer level'
    });
})


module.exports = router;