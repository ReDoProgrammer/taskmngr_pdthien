const router = require('express').Router();
const Mapping = require('../../models/mapping-model');
const { authenticateAccountantToken } = require("../../../middlewares/accountant-middleware");



router.get('/',authenticateAccountantToken, async (req, res) => {
    //chir load cac level da dc map
    let maps = await Mapping.find({}).populate('levels');
    return res.status(200).json({
        msg:`Load customer job leves successfully!`,
        maps
    })
});



module.exports = router;