const router = require('express').Router();
const Size = require('../../models/size-model');
const { authenticateAccountantToken } = require("../../../middlewares/accountant-middleware");



router.get('/',authenticateAccountantToken, (req, res) => {
    Size.find({}, (err, sizes) => {
        if (err) {
            return res.status(500).json({
                msg: 'load size list failed'
            });
        }

        return res.status(200).json({
            msg: 'Load size list successfully!',
            sizes: sizes
        });
    });
});



module.exports = router;