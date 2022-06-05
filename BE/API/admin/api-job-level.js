const router = require('express').Router();
const JobLevel = require('../../models/job-level-model');
const ParentsLevel = require('../../models/parents-level-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");



/*
    api này dùng để quản trị các joblevel ( loại mặt hàng của khác)
*/

router.get('/list-by-parents',authenticateAdminToken,async (req,res)=>{
    let {pId} = req.query;
    
    let parents = await ParentsLevel.findById(pId);
    if(!parents){
        return res.status(404).json({
            msg:`Parents level not found!`
        })
    }


    JobLevel
    .find({_id: {$in:parents.job_levels}})
    .then(levels =>{
        return res.status(200).json({
            msg:`Load job levels by parents level successfully!`,
            levels
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Load job levels by parents level failed with error: ${new Error(err.message)}`
        })
    })
})

router.get('/',authenticateAdminToken,(req,res)=>{
    JobLevel
    .find({})
    .exec()
    .then(jl=>{        
        return res.status(200).json({
            msg:`Load job levels list successfully!!`,
            jl
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not load job levels list with error: ${new Error(err.message)}`
        })
    })
})

router.get('/detail',authenticateAdminToken,(req,res)=>{
    let {id} = req.query;
    JobLevel
    .findById(id)
    .exec()
    .then(jl=>{
        if(jl == null){
            return res.status(404).json({
                msg:'Job level not found!'
            })
        }
        return res.status(200).json({
            msg:`Load job level successfully!`,
            jl
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not get joblevel with error: ${new Error(err.message)}`
        })
    })
})

router.post('/',authenticateAdminToken,(req,res)=>{
    let {name,description} = req.body;
    let jl = new JobLevel({
        name,
        description
    });

    jl.save()
    .then(_=>{
        return res.status(201).json({
            msg:`Job level has been created`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not create job level with error: ${new Error(err.message)}`
        })
    })

})

router.put('/',authenticateAdminToken,(req,res)=>{
    let {id,name,description} = req.body;
    JobLevel.findByIdAndUpdate({_id:id},{
        name,
        description
    },{new:true},(err,jl)=>{
        if(err){
            return res.status(500).json({
                msg:`Update job level failed with error: ${new Error(err.message)}`
            })
        }
        if(jl == null){
            return res.status(404).json({
                msg:'Job level not found'
            })
        }

        return res.status(200).json({
            msg:`Update job level successfully!`
        })
    })
})

router.delete('/',authenticateAdminToken,(req,res)=>{
    let {id} = req.body;
    JobLevel
    .findByIdAndDelete(id)
    .then(_=>{
        return res.status(200).json({
            msg:`Job level has been deleted!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Delete job level failed with error: ${new Error(err.message)}`
        })
    })
})

router.get('/customer',authenticateAdminToken,(req,res)=>{
    let {custId} = req.query();
    
})
module.exports = router;