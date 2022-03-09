const router = require('express').Router();
const NationalStyle = require('../../models/national-style-model');

const { authenticateAccountantToken } = require("../../../middlewares/accountant-middleware");



router.get('/',authenticateAccountantToken, (req, res) => {
    NationalStyle.find({}, (err, nss) => {
        if (err) {
            return res.status(500).json({
                msg: `Load national styles list failed with error: ${new Error(err.message)}`
            });
        }
        
        return res.status(200).json({
            msg: 'Load national styles list successfully!',
            nss: nss
        });
    });
});


module.exports = router;