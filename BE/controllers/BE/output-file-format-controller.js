const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/output-file-format/index',{
        layout:'layouts/backend-layout'
    });
})


module.exports = router;