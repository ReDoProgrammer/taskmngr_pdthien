const router = require('express').Router();
const Skill = require('../../models/skill-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");

router.delete('/',  (req, res) => {
    let id = req.body.id;
    Skill.findOneAndDelete({ _id: id }, (err, level) => {
        if (err) {
            return res.status(500).json({
                msg: 'Xóa skill thất bại!',
                error: new Error(err.message)
            });
        }

        if (level) {
            return res.status(200).json({
                msg: 'Xóa skill thành công!'
            });
        } else {
            return res.status(404).json({
                msg: 'Lỗi không tìm thấy skill tương ứng!'
            });
        }

    })
})

router.get('/',authenticateAdminToken, (req, res) => {
    Skill.find({}, (err, skills) => {
        if (err) {
            return res.status(500).json({
                msg: 'load skills list failed'
            });
        }

        return res.status(200).json({
            msg: 'Load skills list successfully!',
            skills: skills
        });
    });
});

router.get('/detail', authenticateAdminToken, (req, res) => {
    let { id } = req.query;
    Skill.findById(id, (err, skill) => {
        if (err) {
            return res.status(500).json({
                msg: 'Lấy thông tin skill thất bại!',
                error: new Error(err.message)
            });
        }
        if (skill) {
            return res.status(200).json({
                msg: 'Lấy thông tin skill thành công!',
                skill: skill
            })
        } else {
            return res.status(404).json({
                msg: 'Không tìm thấy skill tương ứng!'
            });
        }
    })
})


router.post('/', authenticateAdminToken, (req, res) => {
    let { name, description } = req.body;

    //ràng buộc dữ liệu cho đầu vào tên level
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'Vui lòng nhập tên kỹ năng'
        });
    }

    let skill = new Skill({
        name: name,
        description: description      
    });
    skill.save()
        .then(skill => {
            return res.status(201).json({
                msg: 'Thêm mới kỹ năng thành công!',
                skill: skill
            });
        })
        .catch(err => {
            return res.status(500).json({
                msg: 'Thêm mới skill thất bại!',
                error: new Error(err.message)
            });
        })
})

router.put('/', authenticateAdminToken, (req, res) => {
    let { id, name, description } = req.body;

    //ràng buộc dữ liệu cho đầu vào tên level
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'Vui lòng nhập tên skill'
        });
    }



    Skill.findOneAndUpdate({ _id: id }, {
        name,
        description        
    }, { new: true }, (err, skill) => {
        if (err) {
            return res.status(500).json({
                msg: 'Cập nhật thông tin skill thất bại!',
                error: new Error(err.message)
            });
        }

        if (skill) {
            return res.status(200).json({
                msg: 'Cập nhật thông tin skill thành công!',
                skill: skill
            });
        } else {
            return res.status(500).json({
                msg: 'Cập nhật thông tin skill thất bại!'
            });
        }
    })
})

module.exports = router;