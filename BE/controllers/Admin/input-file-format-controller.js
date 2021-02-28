const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/input-file-format/index',{
        layout:'layouts/admin-layout'
    });
})


module.exports = router;