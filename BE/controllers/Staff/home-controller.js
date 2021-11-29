const router = require('express').Router();
const { authenticateStaffToken } = require("../../../middlewares/staff-middleware");

router.get('/default',(req,res)=>{  
    res.render('staff/default',{
        layout:'layouts/auth-layout',
        title:'Staff authentication - Bamboo Photo'
    });
})

router.get('/',(req,res)=>{  
    res.render('staff/home/index',{
        layout:'layouts/front-layout',
        title:'Sale Home page'      
    });
})


module.exports = router;