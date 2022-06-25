const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const CheckIn = require('../../models/staff-checkin');
const Module = require('../../models/module-model');
const { ObjectId } = require('mongodb');

router.put('/', authenticateTLAToken, async (req, res) => {
    let { staffId } = req.body;
    let chk = await CheckIn.findOne({ staff: staffId });

    if (!chk) {
        chk = new CheckIn({
            staff: staffId,
            check: {
                in: new Date()
            }
        })
    } else {

        if (!chk.check[chk.check.length - 1].out) {
            chk.check[chk.check.length - 1].out = new Date();
        } else {
            chk.check.push({
                in: new Date()
            })
        }
    }
    console.log(chk)
    await chk.save()
        .then(_ => {
            return res.status(200).json({
                msg: `Set checkout into staff successfully!`
            })
        })
        .catch(err => {
            console.log(`Can not set checkout into staff with error: ${new Error(err.message)}`)
            return res.status(500).json({
                msg: `Can not set checkout into staff with error: ${new Error(err.message)}`
            })
        })




})

router.get('/list-staffs-by-module', authenticateTLAToken, async (req, res) => {
    let { moduleId } = req.query;
    let module = await Module.findById(moduleId).populate('users', 'fullname username');
    if (!module) {
        return res.status(404).json({
            msg: `Module not found!`
        })
    }
    GetCheckInList(module.users)
        .then(checkIn => {
            GetCheckOutList(module.users, checkIn)
                .then(checkOut => {
                    return res.status(200).json({
                        msg:`Load checkin and checkout list by module successfully!`,
                        checkIn,
                        checkOut
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

const GetCheckOutList = (users, checkIn) => {
    return new Promise((resolve, reject) => {
       let m = checkIn.map(x=>x._id);
        const results = users.filter(({ _id: id1 }) => !m.some(id2 => id2.toString() === id1.toString()));
        return resolve(results);        
    })
}

const GetCheckInList = (users) => {
    return new Promise((resolve, reject) => {
        CheckIn
            .find({
                staff: { $in: users },
                'check.out': null
            })
            .populate('staff', 'username fullname')
            .then(ci => {
                return resolve(ci.map(x => x.staff));
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not load checkin list with err: ${new Error(err.message)}`
                })
            })
    })
}



