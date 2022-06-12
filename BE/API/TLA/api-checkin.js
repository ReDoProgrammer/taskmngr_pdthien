const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const CheckIn = require('../../models/staff-checkin');
const User = require('../../models/user-model');
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

router.get('/list-staffs-by-module', authenticateTLAToken, (req, res) => {
    let { moduleId } = req.query;

    GetUsersByModule(moduleId)
        .then(userIds => {          
            GetUsersInRange(userIds)
                .then(users => {                  
                    CheckIn
                        .find({ staff: { $in: users.map(x => x._id) } })
                        .then(staffs => {
                         
                           let staffIds = staffs.map(x=>{return x.staff.toString();})
                           let outList = users.filter(x=>!staffIds.includes(x._id.toString()));

                            Promise.all([GetCheckInList(staffIds),GetCheckOutList(staffIds)])
                           .then(rs=>{                             
                               return res.status(200).json({
                                   msg:`Get checkin and checkout staff successfully!`,
                                   checkIn:rs[0],
                                   checkOut:rs[1].concat(outList)
                               })
                           })
                           .catch(err=>{
                               return res.status(err.code).json({
                                   msg:err.msg
                               })
                           })
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

const GetCheckOutList = (users) => {
    return new Promise((resolve, reject) => {
        CheckIn
            .find({
                staff: { $in: users },
                'check.out': { $ne: null }
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

const GetUsersByModule = (moduleId) => {
    return new Promise((resolve, reject) => {
   
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