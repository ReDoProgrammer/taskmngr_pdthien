const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/skill/index',{
        layout:'layouts/backend-layout'
    });
})


module.exports = router;