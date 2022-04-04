const router = require('express').Router();
const { authenticateAdminToken } = require("../../../middlewares/middleware");
const BonusPenalty = require('../../models/bonus-penalty-model');
const BonusPennaltyLine = require('../../models/bonus-penalty-line-model');


router.get('/detail',authenticateAdminToken,(req,res)=>{
    let {bpId} = req.query;
    BonusPenalty
    .findById(bpId)
    .exec()
    .then(bp=>{
        if(!bp){
            return res.status(404).json({
                msg:`BonusPenalty not found!`
            })
        }

        return res.status(200).json({
            msg:`Get BonusPenalty detail successfully!`,
            bp
        })
    })
})

router.get('/list',authenticateAdminToken,(req,res)=>{
   
    BonusPenalty
    .find()
    .exec()
    .then(bplist=>{
        return res.status(200).json({
            msg:`Get bonus penalties list successfully!`,
            bplist
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not get bonus penalties list with error: ${new Error(err.message)}`
        })
    })
})

router.delete('/',authenticateAdminToken,(req,res)=>{
    let {pId} = req.body;
    BonusPennaltyLine
    .countDocuments({bpId:pId},async (err,count)=>{
        if(err){
            return res.status(500).json({
                msg:`Can not check bonus penalty line belong to this bonus penalty with error: ${new Error(err.message)}`
            })
        }

        if(count>0){
            return res.status(403).json({
                msg:`Can not delete this bonus penalty when bonus penalty lines based on it!`
            })
        }

        await BonusPenalty.findByIdAndDelete(pId,(err)=>{
            if(err){
                return res.status(500).json({
                    msg:`Can not delete this bonus penalty `
                })
            }

            return res.status(200).json({
                msg:`The bonus penalty has been deleted!`
            })
        })
    })
})

router.put('/',authenticateAdminToken, (req,res)=>{
    let {bpId,name,description,is_bonus} = req.body;

    BonusPenalty
    .findByIdAndUpdate(bpId,{
        name,
        description,
        is_bonus
    },{new:true},(err,b)=>{
        if(err){
            return res.status(500).json({
                msg:`Can not update bonus penalty with error: ${new Error(err.message)}`
            })
        }

        if(!b){
            return res.status(404).json({
                msg:`bonus penalty not found!`
            })
        }

        return res.status(200).json({
            msg:`Update bonus penalty successfully!`,
            b
        })
    })
})

router.post('/',authenticateAdminToken,async (req,res)=>{
    let {name,description,is_bonus} = req.body;

    let p = new BonusPenalty({
        name,
        description,
        is_bonus
    });

    await p.save()
    .then(_=>{
        return res.status(201).json({
            msg:`The bonus penalty has been created!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not create new bonus penalty with error: ${new Error(err.message)}`
        })
    })

})


module.exports = router;