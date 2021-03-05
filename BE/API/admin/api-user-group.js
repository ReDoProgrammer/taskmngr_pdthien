const router = require('express').Router();
const UserGroup = require('../../models/user-group-model');

const { authenticateAdminToken } = require("../../../middlewares/middleware");

router.delete('/', authenticateAdminToken, (req, res) => {
    let id = req.body.id;
    UserGroup.findOneAndDelete({ _id: id }, (err, ug) => {
        if (err) {
            return res.status(500).json({
                msg: 'Xóa user group thất bại!',
                error: new Error(err.message)
            });
        }

        if (ug) {
            return res.status(200).json({
                msg: 'Xóa user group thành công!'
            });
        } else {
            return res.status(404).json({
                msg: 'Lỗi không tìm thấy user group tương ứng!'
            });
        }

    })
})

router.get('/', (req, res) => {
  UserGroup.find({}, (err, ugs) => {
        if (err) {
            return res.status(500).json({
                msg: 'load user group list failed'
            });
        }
        console.log(ugs);
        return res.status(200).json({
            msg: 'Load user group list successfully!',
            ugs: ugs
        });
    });
});

router.get('/detail', authenticateAdminToken, (req, res) => {
    let { id } = req.query;
    UserGroup.findById(id, (err, ug) => {
        if (err) {
            return res.status(500).json({
                msg: 'Lấy thông tin user group thất bại!',
                error: new Error(err.message)
            });
        }
        if (ug) {
            return res.status(200).json({
                msg: 'Lấy thông tin user group thành công!',
                ug: ug
            })
        } else {
            return res.status(404).json({
                msg: 'Không tìm thấy user group tương ứng!'
            });
        }
    })
})


router.post('/', authenticateAdminToken, (req, res) => {
    let { name, description } = req.body;


    //ràng buộc dữ liệu cho đầu vào tên size
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'Vui lòng nhập tên user group'
        });
    }

    let ug = new UserGroup({
        name: name,
        description: description        
    });
    ug.save()
        .then(size => {
            return res.status(201).json({
                msg: 'Thêm mới user group thành công!',
                size: size
            });
        })
        .catch(err => {
            return res.status(500).json({
                msg: 'Thêm mới user group thất bại!',
                error: new Error(err.message)
            });
        })
})

router.put('/', authenticateAdminToken, (req, res) => {
    let { id, name, description } = req.body;

    //ràng buộc dữ liệu cho đầu vào tên size
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'Vui lòng nhập tên user group'
        });
    }



    UserGroup.findOneAndUpdate({ _id: id }, {
        name,
        description      
    }, { new: true }, (err, ug) => {
        if (err) {
            return res.status(500).json({
                msg: 'Cập nhật thông tin user group thất bại!',
                error: new Error(err.message)
            });
        }

        if (ug) {
            return res.status(200).json({
                msg: 'Cập nhật thông tin user group thành công!',
                ug: ug
            });
        } else {
            return res.status(500).json({
                msg: 'Cập nhật thông tin user group thất bại!'
            });
        }
    })
})

module.exports = router;


