const router = require('express').Router();
const ColorMode = require('../../models/color-mode-model');
const { authenticateAccountantToken } = require("../../../middlewares/accountant-middleware");



router.get('/',authenticateAccountantToken, (req, res) => {
    ColorMode.find({}, (err, cms) => {
        if (err) {
            return res.status(500).json({
                msg: 'load danh sách color mode thất bại!'
            });
        }

        return res.status(200).json({
            msg: 'Lấy danh sách color mode thành công!',
            cms: cms
        });
    });
});



module.exports = router;