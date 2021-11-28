const router = require('express').Router();

router.get('/',(req,res)=>{  
    res.render('staff/home/index',{
        layout:'layouts/front-layout',
        title:'Sale Home page'      
    });
})


module.exports = router;