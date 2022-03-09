const router = require('express').Router();
const FileFormat = require('../../models/file-format-model');
const { authenticateAccountantToken } = require("../../../middlewares/accountant-middleware");





router.get('/type',authenticateAccountantToken,(req,res)=>{
    let {is_input} = req.query;
    FileFormat.find({is_input}, (err, ffs) => {
        if (err) {
            return res.status(500).json({
                msg: `Lấy danh sách định dạng file ${is_input==true?'đầu vào':'đầu ra'} thất bại!`
            });
        }

        return res.status(200).json({
            msg: `Lấy danh sách định dạng file ${is_input==true?'đầu vào':'đầu ra'} thành công!`,
            ffs: ffs
        });
    });
})



module.exports = router;