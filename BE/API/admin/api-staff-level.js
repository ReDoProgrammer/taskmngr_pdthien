const router = require('express').Router();
const StaffLevel = require('../../models/staff-level-model');
const UserGroup = require('../../models/user-group-model');



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

router.get('/', authenticateAdminToken, async (req, res) => {
    let levels = await StaffLevel.find({})
        .populate('levels');

    return res.status(200).json({
        msg: `Load staff levels list successfully!`,
        levels
    })
});



router.get('/list-by-user-group', authenticateAdminToken, (req, res) => {
    let { groupId } = req.query;
    UserGroup
        .findById(groupId)
        .then(g => {
            if (!g) {
                return res.status(404).json({
                    msg: `User group not fond`
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
        .catch(err => {
            return res.status(500).json({
                msg: `Can not get user group by id with error: ${new Error(err.message)}`
            })
        })

});


router.get('/detail', authenticateAdminToken, async (req, res) => {
    let { id } = req.query;
    let sl = await StaffLevel.findById(id);
    if (!sl) {
        return res.status(404).json({
            msg: `Staff level not found!`
        })
    }
    return res.status(200).json({
        msg: `Load staff level detail successfully!`,
        sl
    })
})

router.get('/get-jobs', authenticateAdminToken, async (req, res) => {
    let { levelId } = req.query;
    let staffLv = await StaffLevel.findById(levelId).populate('levels');
    if (!staffLv) {
        return res.status(404).json({
            msg: `Staff level not found!`
        })
    }

    return res.status(200).json({
        msg: `Load job levels based on staff level successfully!`,
        levels: staffLv.levels
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

router.put('/push-level', authenticateAdminToken, async (req, res) => {
    let { jobLevel, staffLevel } = req.body;

    let sl = await StaffLevel.findById(staffLevel);
    if (!sl) {
        return res.status(404).json({
            msg: `Staff level not found!`
        })
    }
    let check = sl.levels.indexOf(jobLevel);
    if (check > -1) {
        return res.status(303).json({
            msg: `This job level already added into this staff level!`
        })
    }

    sl.levels.push(jobLevel);
    await sl.save()
        .then(_ => {
            return res.status(200).json({
                msg: `Job level has been added into this staff level`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not add  job level into this staff level with error: ${new Error(err.message)}`
            })
        })
})

router.delete('/pull-level', authenticateAdminToken, async (req, res) => {
    let { id ,levelId} = req.body;
    let sl = await StaffLevel.findById(levelId);
    if (!sl) {
        return res.status(404).json({
            msg: `Staff level not found!`
        })
    }

    sl.levels.pull(id);
    await sl.save()
        .then(_ => {
            return res.status(200).json({
                msg: `Job level has been removed from this staff level`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not remove job level from this staff level with error: ${new Error(err.message)}`
            })
        })
})

module.exports = router;