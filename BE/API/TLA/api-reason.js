const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const Reason = require('../../models/reason-model');

router.get('/', authenticateTLAToken, async (req, res) => {
    let reasons = await Reason.find({});
    return res.status(200).json({
        msg: `Load reasons list successfully!`,
        reasons
    })
})


module.exports = router;