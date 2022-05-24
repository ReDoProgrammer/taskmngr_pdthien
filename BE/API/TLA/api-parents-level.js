const router = require('express').Router();
const ParentsLevel = require('../../models/parent-level-model');
const JobLevel = require('../../models/job-level-model');
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");



router.get('/list', (req, res) => {
    ParentsLevel.find({}, (err, pls) => {
        if (err) {
            return res.status(500).json({
                msg: `Can not load parents levels list with error: ${new Error(err.message)}`
            });
        }

        return res.status(200).json({
            msg: `Load parents levels list successfully!`,
            pls
        });
    });
});


module.exports = router;