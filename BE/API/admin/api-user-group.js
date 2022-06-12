const router = require('express').Router();
const UserGroup = require('../../models/user-group-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");

router.delete('/', authenticateAdminToken, async (req, res) => {
    let {ugId} = req.body;
    let ug = await UserGroup.findById(ugId);
    if (!ug) {
        return res.status(404).json({
            msg: `User group not found!`
        })
    }
    if (ug.users.length > 0) {
        return res.status(303).json({
            msg: `Can not delete this group when having users belong to it!`
        })
    }

    await ug.delete()
        .then(_ => {
            return res.status(200).json({
                msg: `User group has been deleted!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not delete this user group with error: ${new Error(err.message)}`
            })
        })
})

router.get('/list', async (req, res) => {
    let ugs = await UserGroup.find({});
    return res.status(200).json({
        msg: `Load user groups successfully!`,
        ugs
    })
});

router.get('/detail', authenticateAdminToken, (req, res) => {
    let { id } = req.query;
    UserGroup.findById(id)
        .populate({
            path: 'wages',
            populate: { path: 'skill' }
        })
        .populate({
            path: 'wages',
            populate: { path: 'level' }
        })
        .exec((err, ut) => {
            if (err) {
                return res.status(500).json({
                    msg: 'can not get user type detail',
                    error: new Error(err.message)
                })
            }
            if (ut) {
                return res.status(200).json({
                    msg: 'get user type detail successfully',
                    ut: ut
                })
            }
            else {
                return res.status(403).json({
                    msg: 'User type not found!'
                })
            }
        })

})


router.post('/', authenticateAdminToken, (req, res) => {
    let { name, description } = req.body;


    //validation user type name
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'Please input user type name'
        });
    }




    let ut = new UserGroup({
        name,
        description
    });
    ut.save()
        .then(ug => {
            return res.status(201).json({
                msg: `New user group has been created successfully!`,
                ug
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: 'Can not create user type!',
                error: new Error(err.message)
            });
        })
})

router.put('/', authenticateAdminToken, (req, res) => {
    let { id, name, description, wages } = req.body;

    //ràng buộc dữ liệu cho đầu vào tên size
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'Please input user type name'
        });
    }



    UserGroup.findOneAndUpdate({ _id: id }, {
        name,
        description
    }, { new: true }, (err, ut) => {
        if (err) {
            return res.status(500).json({
                msg: 'Can not update user type!',
                error: new Error(err.message)
            });
        }

        if (ut) {
            return res.status(200).json({
                msg: `Update user group successfully!`
            })
        } else {
            return res.status(500).json({
                msg: 'Can not found user type!'
            });
        }
    })
})









module.exports = router;


