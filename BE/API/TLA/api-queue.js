const router = require('express').Router();
const Queue = require('../../models/queue-model');
const Task = require('../../models/task-model');
const StaffJobLevel = require('../../models/staff-job-level-model');
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const { getStaffsFromJobLevel } = require('../common');

router.post('/', authenticateTLAToken, (req, res) => {

    let { taskId } = req.body;   
    setRegistedEditor(taskId)
    .then(t=>{
        console.log(t);
    })
    .catch(err=>{
        return res.status(err.code).json({
            msg:err.msg
        })
    })
    


})

module.exports = router;

const setRegistedEditor = (taskId)=>{
    return new Promise((resolve,reject)=>{
        Task
        .findById(taskId)
        .exec()
        .then(t=>{
            if(!t){
                return reject({
                    code:404,
                    msg:`Task not found!`
                })
            }
            getStaffLevelFromJobLevel(t.level)
            .then(sls=>{
                console.log(sls);
            })
            .catch(err=>{
                return res.status(err.code).json({
                    msg:err.msg
                })
            })
            return resolve(t);

        })
        .catch(err=>{
            console.log(`Can not get task by id with error: ${new Error(err.message)}`);
            return reject({
                code:500,
                msg:`Can not get task by id with error: ${new Error(err.message)}`
            })
        })
    })
}

//ham tra ve staff level tu job level
const getStaffLevelFromJobLevel = (jobLvId)=>{
    return new Promise((resolve,reject)=>{
        StaffJobLevel
        .find({job_lv:jobLvId})
        .exec()
        .then(sjls=>{
            if(sjls.length==0){
                return reject({
                    code:404,
                    msg:`Staff levels not found!`
                })
            }
            let sls = sjls.map(x=>{
                return x.staff_lv
            })
            return resolve(sls)
        })
        .catch(err=>{
            return reject({
                code:500,
                msg:`Can not get staff levels from job level id with error: ${new Error(err.message)}`
            })
        })
    })
}


//hàm trả về editor đã đăng ký nhận task sớm nhất 
const getEarliestRegistedEditor = (userIds) => {
    return new Promise((resolve, reject) => {
        Queue
            .findOne({
                staff: { $in: userIds }
            })
            .sort({ timestamp: 1 })           
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

