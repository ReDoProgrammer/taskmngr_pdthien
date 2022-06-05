const router = require('express').Router();
const RootLevel = require('../../models/root-level-model');
const ParentsLevel = require('../../models/parents-level-model');
const { authenticateAccountantToken } = require("../../../middlewares/accountant-middleware");



router.get('/',authenticateAccountantToken, async (req, res) => {
    let {rootId} = req.query;
    let root = await RootLevel.findById(rootId);
    if(!root){
        return res.status(404).json({
            msg:`Root level not found!`
        })
    }

    let parentsList = await ParentsLevel.find({_id:{$in:root.parents}}).populate('job_levels');
    if(parentsList.length == 0){
        return res.status(303).json({
            msg:`Please contact your administrator to set parents list first!`
        })
    }

    return res.status(200).json({
        msg:`Get parents list based on root level successfully!`,
        parentsList
    }) 

});



module.exports = router;