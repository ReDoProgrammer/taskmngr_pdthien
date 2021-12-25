const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/skill/index',{
        layout:'layouts/admin-layout',
        title:'Staff skill'
    });
})


module.exports = router;