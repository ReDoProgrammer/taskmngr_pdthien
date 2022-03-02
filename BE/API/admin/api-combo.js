const router = require('express').Router();
const Combo = require('../../models/combo-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");



router.get('/list',authenticateAdminToken,(req,res)=>{
    Combo
    .find({})
    .exec()
    .then(cbs=>{
        return res.status(200).json({
            msg:`Get combo list successfully!`,
            cbs
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not get combo list with error: ${new Error(err.message)}`
        })
    })
})

router.get('/detail',authenticateAdminToken,(req,res)=>{
    let {_id} = req.query;
    Combo
    .findById(_id)
    .exec()
    .then(combo=>{
        if(!combo){
            return res.status(404).json({
                msg:`Combo not found!`
            })
        }

        return res.status(200).json({
            msg:`Get combo detail successfully!`,
            combo
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not get combo info with error: ${new Error(err.message)}`
        })
    })
})


router.delete('/',authenticateAdminToken,(req,res)=>{
    let {_id} = req.body;
    Combo.findByIdAndDelete(_id)
    .exec()
    .then(combo=>{
        if(!combo){
            return res.status(404).json({
                msg:`Combo not found!`
            })
        }
        return res.status(200).json({
            msg:`The combo has been deleted!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not delete this combo with error: ${new Error(err.message)}`
        })
    })
    
})

router.put('/',authenticateAdminToken,(req,res)=>{
    let {_id,name,description,price}=req.body;
    Combo
    .findByIdAndUpdate(_id,
        {
            name,
            description,
            price
        },{new:true},(err,combo)=>{
            if(err){
                return res.status(500).json({
                    msg:`Can not update combo with error: ${new Error(err.message)}`
                })
            }

            if(!combo){
                return res.status(404).json({
                    msg:`Combo not found!`
                })
            }
            return res.status(200).json({
                msg:`Update combo successfully!`,
                combo
            })
        })
})


router.post('/',authenticateAdminToken,(req,res)=>{
    let {name,description,price}  = req.body;
    let combo = new Combo({
        name,
        description,
        price
    });

    combo
    .save()
    .then(_=>{
        return res.status(201).json({
            msg:`The combo has been created!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not create combo with error: ${new Error(err.message)}`
        })
    })
})

module.exports = router;