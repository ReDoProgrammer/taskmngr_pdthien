const Job = require('../../models/job-model');
const Task = require('../../models/task-model');
const StaffJobLevel = require('../../models/staff-job-level-model');
const ObjectId = require('mongodb').ObjectId;
const _MODULE = 'QA';
const {
    getUser,
    getModule,
    getWage,
    GetJobLevelsByStaffLevel } = require('../common');

const getTask = (staffId) => {
    return new Promise((resolve, reject) => {
        getUser(staffId)
            .then(u => {
                Promise.all([GetProcessingJobs(staffId), GetJobLevelsByStaffLevel(u.user_level._id)])
                    .then(rs => {
                        if (rs[1].length > 0) {
                            getModule(_MODULE)
                                .then(m => {
                                    let jobLevels = rs[1].map(x => {
                                        return x.job_lv;
                                    })

                                    switch (rs[0].length) {
                                        
                                        case 0://trường hợp Q.A hiện không xử lý bất kì job nào
                                            NoJOB(jobLevels)
                                                .then(task => {  

                                                    getWage(u._id, task.basic.level, m._id)
                                                        .then(wage => {
                                                            return resolve({
                                                                task,
                                                                wage
                                                            });
                                                        })
                                                        .catch(err => {
                                                            return reject(err);
                                                        })

                                                })
                                                .catch(err => {
                                                    return reject(err);
                                                })
                                            break;
                                        case 1:
                                                
                                            //trường hợp Q.A đang xử lý 1 job                                           
                                            HaveJOB(rs[0], jobLevels)
                                                .then(task => {
                                                    if(!task){
                                                        return reject({
                                                            code:404,
                                                            msg:`No available task!`
                                                        })
                                                    }

                                                    getWage(u._id, task.basic.level, m._id)
                                                        .then(wage => {
                                                            return resolve({
                                                                task,
                                                                wage
                                                            });
                                                        })
                                                        .catch(err => {
                                                            return reject(err);
                                                        })
                                                })
                                                .catch(err => {
                                                    if (err.code == 404) {
                                                        NoJOB(jobLevels)
                                                            .then(task => {
                                                                getWage(u._id, task.basic.level, m._id)
                                                                    .then(wage => {
                                                                        return resolve({
                                                                            task,
                                                                            wage
                                                                        });
                                                                    })
                                                                    .catch(err => {
                                                                        return reject(err);
                                                                    })

                                                            })
                                                            .catch(err => {
                                                                return reject(err);
                                                            })
                                                    } else {
                                                        return reject(err);
                                                    }

                                                })
                                            break;                                       
                                        default:
                                            return reject({
                                                code: 403,
                                                msg: `You can not get more task!`
                                            })

                                    }


                                })
                                .catch(err => {
                                    return reject(err);
                                })

                        } else {
                            return reject({
                                code: 403,
                                msg: `You are not set wage. Please contact administrator first!`
                            })
                        }



                    })
                    .catch(err => {
                        return reject(err)
                    })
            })
            .catch(err => {
                return resolve(err)
            })



    })
}


module.exports = {
    getTask
}

//lấy những task chưa có qa nào xử lý
const HaveJOB = (jobIds, jobLevelIds) => {

    return new Promise((resolve, reject) => {
        Task
            //lấy những task chưa có qa nào nhận
            .findOne({
                'basic.job': { $in: jobIds },
                'basic.level': { $in: jobLevelIds },
                status: 1// đã được editor submit
            })
            .or([
                { qa: { $size: 0 } },
                { 'qa.unregisted': true }
            ])
            .sort({ 'basic.deadline.end': 1 })// sắp xếp tăng dần theo deadline
            .then(task => {
                if (!task) {
                    return reject({
                        code: 404,
                        msg: `No available task!`
                    })
                }
                return resolve(task)
            })
            .catch(err => {
                console.log( `HAVE JOB. Can not get initial task in jobs list with error: ${new Error(err.message)}`);
                return reject({
                    code: 500,
                    msg: `Can not get initial task in jobs list with error: ${new Error(err.message)}`
                })
            })
    })
}


const NoJOB = (jobLevelIds) => {
    return new Promise((resolve, reject) => {
        Task
            .findOne({
                'basic.level': { $in: jobLevelIds },
                status: 1// đã được editor submited
            })
            .or([
                { qa: { $size: 0 } },
                { 'qa.unregisted': true }
            ])
            .sort({ 'basic.deadline.end': 1 })
            .then(task => {
                if (!task) {
                    return reject({
                        code: 404,
                        msg: `No available task!`
                    })
                }
                if(task.qa.length> 0 && task.qa[task.qa.length-1].unregisted == false){
                    return reject({
                        code:403,
                        msg:`Task has been processing by another Q.A!`
                    })
                }
                return resolve(task);
            })
            .catch(err => {
                console.log(`NO JOB. Can not get more task with error: ${new Error(err.message)}`);
                return reject({
                    code: 500,
                    msg: `Can not get more task with error: ${new Error(err.message)}`
                })
            })
    })
}





//lấy những job mà editor đăng nhập đang xử lý
const GetProcessingJobs = (staffId) => {

    return new Promise((resolve, reject) => {
        Task
            .aggregate([
                {
                    $match: {
                        'qa.staff': ObjectId(staffId),
                        status: {$lt:2},
                       'qa.unregisted': false// task có trạng thái unregisted = false <=> đang xử lý
                    }
                },
                { $group: { _id: '$basic.job' } }
            ])
            .then(jobs => {                
                return resolve(jobs.map(x => { return x._id }))
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not get jobs list wich you are processing with error: ${new Error(err.message)}`
                })
            })
    })
}
