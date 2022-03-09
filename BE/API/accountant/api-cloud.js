const router = require('express').Router();
const Cloud = require('../../models/cloud-model');
const { authenticateAccountantToken } = require("../../../middlewares/accountant-middleware");



router.get('/',authenticateAccountantToken, (req, res) => {
    Cloud.find({}, (err, clouds) => {
        if (err) {
            return res.status(500).json({
                msg: 'load danh sách cloud thất bại!'
            });
        }

        return res.status(200).json({
            msg: 'Lấy danh sách cloud thành công!',
            clouds: clouds
        });
    });
});



module.exports = router;