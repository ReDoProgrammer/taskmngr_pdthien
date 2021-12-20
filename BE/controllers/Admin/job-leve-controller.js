const router = require('express').Router();


router.get('/',(req,res)=>{
    res.render('admin/job-level/index',{
        layout:'layouts/admin-layout',
        title: 'Job level'
    });
})


module.exports = router;