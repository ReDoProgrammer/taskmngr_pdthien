const router = require('express').Router();
const { TLAMiddleware } = require("../../../middlewares/tla-middleware");
const User = require('../../models/user-model');


router.get('/list',(req,res)=>{  
    User.find({
        is_active:true,
        
    }) 
    .select('fullname')   
    .then(users=>{
        return res.status(200).json({
            msg:'Load users successfully!',
            users:users
        })
    })
    .catch(err=>{
        console.log(new Error(`log users failed: {}`));

        return res.status(500).json({
            msg:'Load users list failed!',
            error: new Error(err.message)
        })
    })
})





module.exports = router;