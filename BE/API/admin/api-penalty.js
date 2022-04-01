const router = require('express').Router();
const { authenticateAdminToken } = require("../../../middlewares/middleware");
const Penalty = require('../../models/penalty-model');
const PenaltyTime = require('../../models/penalty-time-model');


router.get('/detail',authenticateAdminToken,(req,res)=>{
    let {pId} = req.query;
    Penalty
    .findById(pId)
    .exec()
    .then(penalty=>{
        if(!penalty){
            return res.status(404).json({
                msg:`Penalty not found!`
            })
        }

        return res.status(200).json({
            msg:`Get penalty detail successfully!`,
            penalty
        })
    })
})

router.get('/list',authenticateAdminToken,(req,res)=>{
    Penalty
    .find({})
    .exec()
    .then(pennalties=>{
        return res.status(200).json({
            msg:`Get penalties list successfully!`,
            pennalties
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not get penalties list with error: ${new Error(err.message)}`
        })
    })
})

router.delete('/',authenticateAdminToken,(req,res)=>{
    let {pId} = req.body;
    PenaltyTime
    .countDocuments({penalty:pId},async (err,count)=>{
        if(err){
            return res.status(500).json({
                msg:`Can not check penalty times belong to this penalty with error: ${new Error(err.message)}`
            })
        }

        if(count>0){
            return res.status(403).json({
                msg:`Can not delete this penalty when penalty times based on it!`
            })
        }

        await Penalty.findByIdAndDelete(pId,(err)=>{
            if(err){
                return res.status(500).json({
                    msg:`Can not delete this punish `
                })
            }

            return res.status(200).json({
                msg:`The penalty has been deleted!`
            })
        })
    })
})

router.put('/',authenticateAdminToken, (req,res)=>{
    let {pId,name,description} = req.body;

    Penalty
    .findByIdAndUpdate(pId,{
        name,
        description
    },{new:true},(err,p)=>{
        if(err){
            return res.status(500).json({
                msg:`Can not update penalty with error: ${new Error(err.message)}`
            })
        }

        if(!p){
            return res.status(404).json({
                msg:`penalty not found!`
            })
        }

        return res.status(200).json({
            msg:`Update penalty successfully!`,
            p
        })
    })
})

router.post('/',authenticateAdminToken,async (req,res)=>{
    let {name,description} = req.body;

    let p = new Penalty({
        name,
        description
    });

    await p.save()
    .then(_=>{
        return res.status(201).json({
            msg:`The punish reason has been created!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not create new punish reason with error: ${new Error(err.message)}`
        })
    })

})


module.exports = router;