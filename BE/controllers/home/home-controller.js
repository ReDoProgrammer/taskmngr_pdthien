const router = require('express').Router();


router.get('/',(req,res)=>{  
    res.render('home/index',{
        layout:'layouts/home-layout',
        title:'Bamboophoto.com'      
    });
})


module.exports = router;