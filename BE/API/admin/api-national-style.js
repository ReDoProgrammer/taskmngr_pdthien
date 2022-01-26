const router = require('express').Router();
const NationalStyle = require('../../models/national-style-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");
const nationalStyleModel = require('../../models/national-style-model');

router.delete('/', authenticateAdminToken, (req, res) => {
    let id = req.body.id;
    NationalStyle.findOneAndDelete({ _id: id }, (err, ns) => {
        if (err) {
            return res.status(500).json({
                msg: 'Xóa style theo quốc gia thất bại!',
                error: new Error(err.message)
            });
        }

        if (ns) {
            return res.status(200).json({
                msg: 'Xóa style theo quốc gia thành công!'
            });
        } else {
            return res.status(404).json({
                msg: 'Lỗi không tìm thấy style theo quốc gia tương ứng!'
            });
        }

    })
})

router.get('/', (req, res) => {
    NationalStyle.find({}, (err, nss) => {
        if (err) {
            return res.status(500).json({
                msg: 'load levels list failed'
            });
        }
        
        return res.status(200).json({
            msg: 'Load levels list successfully!',
            nss: nss
        });
    });
});

router.get('/detail', authenticateAdminToken, (req, res) => {
    let { id } = req.query;
    NationalStyle.findById(id, (err, ns) => {
        if (err) {
            return res.status(500).json({
                msg: 'Lấy thông tin style theo quốc gia thất bại!',
                error: new Error(err.message)
            });
        }
        if (ns) {
            return res.status(200).json({
                msg: 'Lấy thông tin style theo quốc gia thành công!',
                ns: ns
            })
        } else {
            return res.status(404).json({
                msg: 'Không tìm thấy style theo quốc gia tương ứng!'
            });
        }
    })
})


router.post('/', authenticateAdminToken, (req, res) => {
    let { name, description } = req.body;

    //ràng buộc dữ liệu cho đầu vào tên level
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'Vui lòng nhập tên style theo quốc gia'
        });
    }

    let ns = new NationalStyle({
        name: name,
        description: description       
    });
    ns.save()
        .then(ns => {
            return res.status(201).json({
                msg: 'Thêm mới style theo quốc gia thành công!',
                ns: ns
            });
        })
        .catch(err => {
            return res.status(500).json({
                msg: 'Thêm mới style theo quốc gia thất bại!',
                error: new Error(err.message)
            });
        })
})

router.put('/', authenticateAdminToken, (req, res) => {
    let { id, name, description } = req.body;

    //ràng buộc dữ liệu cho đầu vào tên level
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'Vui lòng nhập tên style theo quốc gia!'
        });
    }



    NationalStyle.findOneAndUpdate({ _id: id }, {
        name,
        description      
    }, { new: true }, (err, ns) => {
        if (err) {
            return res.status(500).json({
                msg: 'Cập nhật thông tin style theo quốc gia thất bại!',
                error: new Error(err.message)
            });
        }

        if (ns) {
            return res.status(200).json({
                msg: 'Cập nhật thông tin style theo quốc gia thành công!',
                ns: ns
            });
        } else {
            return res.status(500).json({
                msg: 'Cập nhật thông tin style theo quốc gia thất bại!'
            });
        }
    })
})

module.exports = router;