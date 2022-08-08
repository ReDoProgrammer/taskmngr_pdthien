const router = require('express').Router();
const Mapping = require('../../models/mapping-model');
const { authenticateAccountantToken } = require("../../../middlewares/accountant-middleware");



router.get('/',authenticateAccountantToken, async (req, res) => {
    let maps = await Mapping.find({});
    return res.status(200).json({
        msg:`Load customer job leves successfully!`,
        maps
    })
});



module.exports = router;