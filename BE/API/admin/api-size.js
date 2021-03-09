const router = require('express').Router();
const Size = require('../../models/size-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");

router.delete('/', authenticateAdminToken, (req, res) => {
    let id = req.body.id;
    Size.findOneAndDelete({ _id: id }, (err, size) => {
        if (err) {
            return res.status(500).json({
                msg: 'Xóa size thất bại!',
                error: new Error(err.message)
            });
        }

        if (size) {
            return res.status(200).json({
                msg: 'Xóa size thành công!'
            });
        } else {
            return res.status(404).json({
                msg: 'Lỗi không tìm thấy size tương ứng!'
            });
        }

    })
})

router.get('/', (req, res) => {
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

router.get('/detail', authenticateAdminToken, (req, res) => {
    let { id } = req.query;
    Size.findById(id, (err, size) => {
        if (err) {
            return res.status(500).json({
                msg: 'Lấy thông tin size thất bại!',
                error: new Error(err.message)
            });
        }
        if (size) {
            return res.status(200).json({
                msg: 'Lấy thông tin size thành công!',
                size: size
            })
        } else {
            return res.status(404).json({
                msg: 'Không tìm thấy size tương ứng!'
            });
        }
    })
})


router.post('/', authenticateAdminToken, (req, res) => {
    let { name, description } = req.body;

    console.log({ name, description });

    //ràng buộc dữ liệu cho đầu vào tên size
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'Vui lòng nhập tên size'
        });
    }

    let size = new Size({
        name: name,
        description: description        
    });
    size.save()
        .then(size => {
            return res.status(201).json({
                msg: 'Thêm mới size thành công!',
                size: size
            });
        })
        .catch(err => {
            return res.status(500).json({
                msg: 'Thêm mới size thất bại!',
                error: new Error(err.message)
            });
        })
})

router.put('/', authenticateAdminToken, (req, res) => {
    let { id, name, description } = req.body;

    //ràng buộc dữ liệu cho đầu vào tên size
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'Vui lòng nhập tên size'
        });
    }



    Size.findOneAndUpdate({ _id: id }, {
        name,
        description      
    }, { new: true }, (err, size) => {
        if (err) {
            return res.status(500).json({
                msg: 'Cập nhật thông tin size thất bại!',
                error: new Error(err.message)
            });
        }

        if (size) {
            return res.status(200).json({
                msg: 'Cập nhật thông tin size thành công!',
                size: size
            });
        } else {
            return res.status(500).json({
                msg: 'Cập nhật thông tin size thất bại!'
            });
        }
    })
})

module.exports = router;