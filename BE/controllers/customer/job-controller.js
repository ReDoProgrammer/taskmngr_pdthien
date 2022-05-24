const router = require('express').Router();
router.get('/',(req,res)=>{  
    res.render('customer/job/index',{
        layout:'layouts/customer-layout',
        title:'<i class="fa fa-tasks" aria-hidden="true"></i> Job Mngr'      
    });
})


module.exports = router;