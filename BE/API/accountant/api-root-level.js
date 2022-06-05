const router = require('express').Router();
const RootLevel = require('../../models/root-level-model');
const { authenticateAccountantToken } = require("../../../middlewares/accountant-middleware");



router.get('/',authenticateAccountantToken, async (req, res) => {
    let roots = await RootLevel.find({}).populate('parents');
    if(roots.length == 0){
        return res.status(303).json({
            msg:`Please contact administrator to set root level before continue!`
        })
    }

    return res.status(200).json({
        msg:`Load root levels list successfully!`,
        roots
    })

});



module.exports = router;