const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const Link = require('../../models/link-model');

router.get('/',authenticateTLAToken,(req,res)=>{
    let {jobId} = req.query;
    Link
    .find({job:jobId})
    .populate('created_by','fullname')
    .sort({created_at:-1})
    .exec()
    .then(links=>{
        return res.status(200).json({
            msg:`Load links list by job successfully!`,
            links
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not load links list by job with error: ${new Error(err.message)}`
        })
    })
})

router.put('/',authenticateTLAToken,(req,res)=>{
    let {lId} = req.body;

    Link
    .findById(lId)
    .exec()
    .then(async link=>{
        if(!link){
            return res.status(404).json({
                msg:`Link not found!`
            })
        }
        link.checked = !link.checked;
        link.updated_at = new Date();
        link.updated_by = req.user._id;

        await link.save()
        .then(_=>{
            return res.status(200).json({
                msg:`Change link state successfully!`
            })
        })
        .catch(err=>{
            return res.status(500).json({
                msg:`Can not change link state with error: ${new Error(err.message)}`
            })
        })

    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not find link by id with error: ${new Error(err.message)}`
        })
    })
})



module.exports = router;