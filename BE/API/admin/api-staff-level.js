const router = require('express').Router();
const StaffLevel = require('../../models/staff-level-model');
const UserGroup = require('../../models/user-group-model');
const StaffJobLevel = require('../../models/staff-job-level-model');


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

router.get('/list-by-job-level',authenticateAdminToken,(req,res)=>{
    let {jobLevelId} = req.query;
    StaffJobLevel
    .find({
        job_lv:jobLevelId
    })
    .exec()
    .then(sjl=>{
        let staffLevelIds = sjl.map(e=>{
            return e.staff_lv
        })

        StaffLevel
        .find({
            _id:{$in: staffLevelIds}
        })
        .exec()
        .then(sl=>{
            console.log(sl);
            return res.status(200).json({
                msg:`Load staff level with job level successfully!`,
                sl
            })
        })
        .catch(err=>{
            console.log(`Can not load staff level with job level id in caught error: ${new Error(err.message)}`);
            return res.status(500).json({
                msg:`Can not load staff level with job level id in caught error: ${new Error(err.message)}`
            })
        })
    })
    .catch(err=>{
        console.log(`Can not load staff job level with joblevelid caught error: ${new Error(err.message)} `);
        return res.status(500).json({
            msg:`Can not load staff job level with joblevelid caught error: ${new Error(err.message)} `
        })
    })
})

router.get('/list-by-user-group',authenticateAdminToken, (req, res) => {
    let {groupId} = req.query;
    UserGroup
    .findById(groupId)
    .then(g=>{
        if(!g){
            return res.status(404).json({
                msg:`User group not fond`
            })
        }

        console.log(g);

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
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not get user group by id with error: ${new Error(err.message)}`
        })
    })
    
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