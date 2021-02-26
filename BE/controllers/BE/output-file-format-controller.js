const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/output-file-format/index',{
        layout:'layouts/admin-layout'
    });
})


module.exports = router;