const router = require('express').Router();
const ColorMode = require('../../models/color-mode-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");

router.delete('/', authenticateAdminToken, (req, res) => {
    let id = req.body.id;
    ColorMode.findOneAndDelete({ _id: id }, (err, cm) => {
        if (err) {
            return res.status(500).json({
                msg: 'Xóa color mode thất bại!',
                error: new Error(err.message)
            });
        }

        if (cm) {
            return res.status(200).json({
                msg: 'Xóa color mode thành công!'
            });
        } else {
            return res.status(404).json({
                msg: 'Lỗi không tìm thấy color mode tương ứng!'
            });
        }

    })
})

router.get('/', (req, res) => {
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

router.get('/detail', authenticateAdminToken, (req, res) => {
    let { id } = req.query;
    ColorMode.findById(id, (err, cm) => {
        if (err) {
            return res.status(500).json({
                msg: 'Lấy thông tin color mode thất bại!',
                error: new Error(err.message)
            });
        }
        if (cm) {
            return res.status(200).json({
                msg: 'Lấy thông tin color mode thành công!',
                cm: cm
            })
        } else {
            return res.status(404).json({
                msg: 'Không tìm thấy color mode tương ứng!'
            });
        }
    })
})


router.post('/', authenticateAdminToken, (req, res) => {
    let { name, description } = req.body;


    //ràng buộc dữ liệu cho đầu vào tên level
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'Vui lòng nhập tên color mode!'
        });
    }

    let cm = new ColorMode({
        name: name,
        description
    });
    cm.save()
        .then(cm => {
            return res.status(201).json({
                msg: 'Thêm mới color mode thành công!',
                cm: cm
            });
        })
        .catch(err => {
            return res.status(500).json({
                msg: 'Thêm mới color mode thất bại!',
                error: new Error(err.message)
            });
        })
})

router.put('/', authenticateAdminToken, (req, res) => {
    let { id, name, description } = req.body;


    //ràng buộc dữ liệu cho đầu vào tên level
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'Vui lòng nhập tên color mode'
        });
    }



    ColorMode.findOneAndUpdate({ _id: id }, {
        name,
        description
    }, { new: true }, (err, cm) => {
        if (err) {
            return res.status(500).json({
                msg: 'Cập nhật thông tin color mode thất bại!',
                error: new Error(err.message)
            });
        }

        if (cm) {
            return res.status(200).json({
                msg: 'Cập nhật thông tin color mode thành công!',
                cm: cm
            });
        } else {
            return res.status(500).json({
                msg: 'Cập nhật thông tin color mode thất bại!'
            });
        }
    })
})

module.exports = router;