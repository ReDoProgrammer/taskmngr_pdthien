const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const CheckIn = require('../../models/staff-checkin');
const User = require('../../models/user-model');
const Module = require('../../models/module-model');
const UserModule = require('../../models/user-module-model');

router.put('/in', authenticateTLAToken, (req, res) => {
    let { checkIn } = req.body;
    console.log(checkIn)

    checkIn.forEach(async st => {
        let user = await CheckIn.findOne({ staff: st });
        if (!user) {
            let s = new CheckIn({
                staff: st,
                check: [
                    {
                        in: new Date()
                    }
                ]
            });
            await s.save();
        }
    })

})

router.get('/list-staffs-by-module', authenticateTLAToken, (req, res) => {
    let { moduleId } = req.query;

    GetUsersByModule(moduleId)
        .then(userIds => {
            GetUsersInRange(userIds)
                .then(users => {
                    CheckIn
                        .find({})
                        .then(staffs => {
                            let checkIn = [];
                            checkOut = [];


                            console.log(users, staffs)

                            if (staffs.length == 0) {
                                checkOut = users;
                                return res.status(200).json({
                                    msg: `Load checkin and checkout staff successfully!`,
                                    checkIn,
                                    checkOut
                                })
                            }






                        })
                        .catch(err => {
                            console.log(`Can not get checkin staffs with error: ${new Error(err.message)}`);
                            return res.status(500).json({
                                msg: `Can not get checkin staffs with error: ${new Error(err.message)}`
                            })
                        })
                })
                .catch(err => {
                    return res.status(err.code).json({
                        msg: err.msg
                    })
                })
        })
        .catch(err => {
            return res.status(err.code).json({
                msg: err.msg
            })
        })
})

router.get('/list-modules', authenticateTLAToken, (req, res) => {
    Module
        .find({ name: { $ne: 'ADMIN' } })
        .then(modules => {
            return res.status(200).json({
                msg: `Load modules list successfully!`,
                modules
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not load modules list with error: ${new Error(err.message)}`
            })
        })
})


module.exports = router;

const GetUsersByModule = (moduleId) => {
    return new Promise((resolve, reject) => {
        UserModule
            .find({ module: moduleId })
            .then(um => {
                let users = um.map(x => {
                    return x.user;
                });
                return resolve(users);
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not get users by module id with error: ${new Error(err.message)}`
                })
            })
    })
}

const GetUsersInRange = (userIds) => {
    return new Promise((resolve, reject) => {
        User
            .find({ _id: { $in: userIds } })
            .select('username fullname username')
            .then(users => {
                return resolve(users);
            })
            .catch(err => {
                console.log(`Can not get users based on module with error: ${new Error(err.message)}`)
                return reject({
                    code: 500,
                    msg: `Can not get users based on module with error: ${new Error(err.message)}`
                })
            })
    })
}