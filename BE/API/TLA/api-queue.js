const router = require('express').Router();
const Queue = require('../../models/queue-model');
const Task = require('../../models/task-model');
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const { getStaffsFromJobLevel } = require('../common');

router.post('/', authenticateTLAToken, (req, res) => {

    let { levelId } = req.body;
    console.log(levelId);

    getStaffsFromJobLevel(levelId)
        .then(users => {
            console.log(users);
            let userIds = users.map(x => {
                return x._id;
            })
            getEarliestRegistedEditor(userIds)
                .then(ed => {
                    console.log(ed);
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

module.exports = router;

//hàm trả về editor đã đăng ký nhận task sớm nhất 
const getEarliestRegistedEditor = (userIds) => {
    return new Promise((resolve, reject) => {
        Queue
            .findOne({
                staff: { $in: userIds }
            })
            .sort({ timestamp: 1 })
            .limit(1)
            .exec()
            .then(q => {
                if (!q) {
                    return reject({
                        code: 404,
                        msg: `Have no editor registing to take more task at the moment!`
                    })
                }
                return resolve(q);
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not get earliest registed editor with error: ${new Error(err.message)}`
                })
            })
    })
}