const router = require('express').Router();
const FileFormat = require('../../models/file-format-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");

router.delete('/', authenticateAdminToken, (req, res) => {
    let id = req.body.id;
    FileFormat.findOneAndDelete({ _id: id }, (err, ff) => {
        if (err) {
            return res.status(500).json({
                msg: 'Xóa định dạng file thất bại!',
                error: new Error(err.message)
            });
        }

        if (ff) {
            return res.status(200).json({
                msg: 'Xóa định dạng file thành công!'
            });
        } else {
            return res.status(404).json({
                msg: 'Lỗi không tìm thấy định dạng tương ứng!'
            });
        }

    })
})

router.get('/', (req, res) => {
    FileFormat.find({}, (err, ffs) => {
        if (err) {
            return res.status(500).json({
                msg: 'load danh sách định dạng file thất bại!'
            });
        }

        return res.status(200).json({
            msg: 'Lấy danh sách định dạng file thành công!',
            ffs: ffs
        });
    });
});

router.get('/type',(req,res)=>{
    let {is_input} = req.query;

    FileFormat.find({}, (err, ffs) => {
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

router.get('/detail', authenticateAdminToken, (req, res) => {
    let { id } = req.query;
    FileFormat.findById(id, (err, ff) => {        
        if (err) {
            return res.status(500).json({
                msg: 'Lấy thông tin định dạng file thất bại!',
                error: new Error(err.message)
            });
        }
        if (ff) {
            return res.status(200).json({
                msg: 'Lấy thông tin định dạng file thành công!',
                ff: ff
            })
        } else {
            return res.status(404).json({
                msg: 'Không tìm thấy định dạng file tương ứng!'
            });
        }
    })
})


router.post('/', authenticateAdminToken, (req, res) => {
    let { name, description,is_input } = req.body;


    //ràng buộc dữ liệu cho đầu vào tên level
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'Vui lòng nhập tên định dạng file'
        });
    }

    let ff = new FileFormat({
        name: name,
        description,
        is_input        
    });
    ff.save()
        .then(ff => {
            return res.status(201).json({
                msg: 'Thêm mới định dạng file thành công!',
                ff: ff
            });
        })
        .catch(err => {
            return res.status(500).json({
                msg: 'Thêm mới định dạng file thất bại!',
                error: new Error(err.message)
            });
        })
})

router.put('/', authenticateAdminToken, (req, res) => {
    let { id, name, description,is_input } = req.body;

  
    //ràng buộc dữ liệu cho đầu vào tên level
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'Vui lòng nhập tên định dạng file'
        });
    }



    FileFormat.findOneAndUpdate({ _id: id }, {
        name,
        description,
        is_input     
    }, { new: true }, (err, ff) => {
        if (err) {
            return res.status(500).json({
                msg: 'Cập nhật thông tin định dạng file thất bại!',
                error: new Error(err.message)
            });
        }

        if (ff) {
            return res.status(200).json({
                msg: 'Cập nhật thông tin định dạng file thành công!',
                ff: ff
            });
        } else {
            return res.status(500).json({
                msg: 'Cập nhật thông tin định dạng file thất bại!'
            });
        }
    })
})

module.exports = router;