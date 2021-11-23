const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const Task = require('../../models/task-model');


router.get('/list',authenticateTLAToken,(req,res)=>{
 
})

router.get('/detail',authenticateTLAToken,(req,res)=>{
    
})

router.post('/',authenticateTLAToken,(req,res)=>{
    let {task} = req.body;
    console.log(task);
})

router.put('/',authenticateTLAToken,(req,res)=>{

})

router.delete('/',authenticateTLAToken,(req,res)=>{

})



module.exports = router;