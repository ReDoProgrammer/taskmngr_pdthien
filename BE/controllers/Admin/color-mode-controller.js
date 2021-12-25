const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/color-mode/index',{
        layout:'layouts/admin-layout',
        title:'Color mode'
    });
})


module.exports = router;