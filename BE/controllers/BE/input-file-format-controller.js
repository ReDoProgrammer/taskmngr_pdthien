const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/input-file-format/index',{
        layout:'layouts/backend-layout'
    });
})


module.exports = router;