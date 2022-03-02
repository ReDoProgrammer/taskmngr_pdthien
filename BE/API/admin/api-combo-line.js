const router = require('express').Router();
const ComboLine = require('../../models/combo-line-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");



router.get('/list',authenticateAdminToken,(req,res)=>{
    let {cb} = req.query;
    ComboLine
    .find({cb:cb})
    .populate('lv')  
    .exec()
    .then(cbls=>{
        return res.status(200).json({
            msg:`Get combolines list successfully!`,
            cbls
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not get combolines list with error: ${new Error(err.message)}`
        })
    })
})

router.get('/detail',authenticateAdminToken,(req,res)=>{
    let {_id} = req.query;
    ComboLine
    .findById(_id)
    .exec()
    .then(cbl=>{
        if(!cbl){
            return res.status(404).json({
                msg:`Comboline not found!`            
            })
        }

        return res.status(200).json({
            msg:`Get comboline detail successfully!`,
            cbl
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not get comboline detail with error: ${new Error(err.message)}`
        })
    })
})


router.delete('/',authenticateAdminToken,(req,res)=>{
    let {_id} = req.body;
    ComboLine
    .findByIdAndDelete(_id)
    .exec()
    .then(cbl=>{
        if(!cbl){
            return res.status(404).json({
                msg:`Comboline not found!`
            })
        }
        return res.status(200).json({
            msg:`Comboline has been deleted!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not delete this comboline with error: ${new Error(err.message)}`
        })
    })
})

router.put('/',authenticateAdminToken,(req,res)=>{
    let {_id,cb,lv,qty} = req.body;
    ComboLine
    .findByIdAndUpdate(_id,
        {
            cb,lv,qty
        },{new:true},(err,cbl)=>{
            if(err){
                return res.status(500).json({
                    msg:`Can not update comboline with error: ${new Error(err.message)}`
                })
            }

            if(!cbl){
                return res.status(404).json({
                    msg:`Comboline not found!`
                })
            }

            return res.status(200).json({
                msg:`Comboline has been updated!`,
                cbl
            })
        })
})

router.post('/', authenticateAdminToken, (req, res) => {
    let { cb, lv, qty } = req.body;
    let cbl = new ComboLine({ cb, lv, qty });

    cbl
        .save()
        .then(_ => {
            return res.status(201).json({
                msg: `Combo line has been created!`
            })
        })
        .catch(err=>{
            return res.status(500).json({
                msg:`Can not create new comboline with error: ${new Error(err.message)}`
            })
        })

})

module.exports = router;