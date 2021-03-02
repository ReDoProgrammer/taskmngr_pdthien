const router = require('express').Router();
const Cloud = require('../../models/cloud-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");

router.delete('/', authenticateAdminToken, (req, res) => {
    let id = req.body.id;
    Cloud.findOneAndDelete({ _id: id }, (err, cloud) => {
        if (err) {
            return res.status(500).json({
                msg: 'Xóa cloud thất bại!',
                error: new Error(err.message)
            });
        }

        if (cloud) {
            return res.status(200).json({
                msg: 'Xóa cloud thành công!'
            });
        } else {
            return res.status(404).json({
                msg: 'Lỗi không tìm thấy cloud tương ứng!'
            });
        }

    })
})

router.get('/', (req, res) => {
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

router.get('/detail', authenticateAdminToken, (req, res) => {
    let { id } = req.query;
    Cloud.findById(id, (err, cloud) => {
        if (err) {
            return res.status(500).json({
                msg: 'Lấy thông tin cloud thất bại!',
                error: new Error(err.message)
            });
        }
        if (cloud) {
            return res.status(200).json({
                msg: 'Lấy thông tin cloud thành công!',
                cloud: cloud
            })
        } else {
            return res.status(404).json({
                msg: 'Không tìm thấy cloud tương ứng!'
            });
        }
    })
})


router.post('/', authenticateAdminToken, (req, res) => {
    let { name, description } = req.body;


    //ràng buộc dữ liệu cho đầu vào tên level
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'Vui lòng nhập tên cloud!'
        });
    }

    let cloud = new Cloud({
        name: name,
        description
    });
    cloud.save()
        .then(cloud => {
            return res.status(201).json({
                msg: 'Thêm mới cloud thành công!',
                cloud: cloud
            });
        })
        .catch(err => {
            return res.status(500).json({
                msg: 'Thêm mới cloud thất bại!',
                error: new Error(err.message)
            });
        })
})

router.put('/', authenticateAdminToken, (req, res) => {
    let { id, name, description } = req.body;


    //ràng buộc dữ liệu cho đầu vào tên level
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'Vui lòng nhập tên cloud'
        });
    }



    Cloud.findOneAndUpdate({ _id: id }, {
        name,
        description
    }, { new: true }, (err, cloud) => {
        if (err) {
            return res.status(500).json({
                msg: 'Cập nhật thông tin cloud thất bại!',
                error: new Error(err.message)
            });
        }

        if (cloud) {
            return res.status(200).json({
                msg: 'Cập nhật thông tin cloud thành công!',
                cloud: cloud
            });
        } else {
            return res.status(500).json({
                msg: 'Cập nhật thông tin cloud thất bại!'
            });
        }
    })
})

module.exports = router;