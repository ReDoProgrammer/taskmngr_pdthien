const router = require('express').Router();
const StaffLevel = require('../../models/staff-level-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");

router.delete('/', authenticateAdminToken, (req, res) => {
    let id = req.body.id;
    StaffLevel.findOneAndDelete({ _id: id }, (err, level) => {
        if (err) {
            return res.status(500).json({
                msg: 'Xóa level thất bại!',
                error: new Error(err.message)
            });
        }

        if (level) {
            return res.status(200).json({
                msg: 'Xóa level thành công!'
            });
        } else {
            return res.status(404).json({
                msg: 'Lỗi không tìm thấy level tương ứng!'
            });
        }

    })
})

router.get('/', (req, res) => {
    StaffLevel.find({}, (err, levels) => {
        if (err) {
            return res.status(500).json({
                msg: 'load levels list failed'
            });
        }

        return res.status(200).json({
            msg: 'Load levels list successfully!',
            levels: levels
        });
    });
});

router.get('/detail', authenticateAdminToken, (req, res) => {
    let { id } = req.query;
    StaffLevel.findById(id, (err, level) => {
        if (err) {
            return res.status(500).json({
                msg: 'Lấy thông tin level thất bại!',
                error: new Error(err.message)
            });
        }
        if (level) {
            return res.status(200).json({
                msg: 'Lấy thông tin level thành công!',
                level: level
            })
        } else {
            return res.status(404).json({
                msg: 'Không tìm thấy level tương ứng!'
            });
        }
    })
})


router.post('/', authenticateAdminToken, (req, res) => {
    let { name, description, status } = req.body;

    //ràng buộc dữ liệu cho đầu vào tên level
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'Vui lòng nhập tên level'
        });
    }

    let level = new StaffLevel({
        name: name,
        description: description,
        status: status
    });
    level.save()
        .then(level => {
            return res.status(201).json({
                msg: 'Thêm mới level thành công!',
                level: level
            });
        })
        .catch(err => {
            return res.status(500).json({
                msg: 'Thêm mới level thất bại!',
                error: new Error(err.message)
            });
        })
})

router.put('/', authenticateAdminToken, (req, res) => {
    let { id, name, description, status } = req.body;

    //ràng buộc dữ liệu cho đầu vào tên level
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'Vui lòng nhập tên level'
        });
    }



    StaffLevel.findOneAndUpdate({ _id: id }, {
        name,
        description,
        status
    }, { new: true }, (err, level) => {
        if (err) {
            return res.status(500).json({
                msg: 'Cập nhật thông tin level thất bại!',
                error: new Error(err.message)
            });
        }

        if (level) {
            return res.status(200).json({
                msg: 'Cập nhật thông tin level thành công!',
                level: level
            });
        } else {
            return res.status(500).json({
                msg: 'Cập nhật thông tin level thất bại!'
            });
        }
    })
})

module.exports = router;