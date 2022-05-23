const Job = require('../../models/job-model');
const Task = require('../../models/task-model');
const StaffJobLevel = require('../../models/staff-job-level-model');
const ObjectId = require('mongodb').ObjectId;
const _MODULE = 'EDITOR';
const {
    getUser,
    getCustomer,
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
                                        case 0:
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
                                            HaveJOB(rs[0], jobLevels)
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
                                        case 2:
                                            rs[0].forEach(j => {//duyệt các job hiện tại đang xử lý
                                                GetTaskByJobId(j._id)//lấy task thuộc 1 trong các job phía trên
                                                    .then(async tasks => {

                                                        HaveJOB(rs[0], jobLevels)
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
                                                                if (err.code == 404) {
                                                                    return reject({
                                                                        code: 404,
                                                                        msg: `You can not get task more than two jobs`
                                                                    })
                                                                }
                                                                return reject(err);
                                                            })
                                                    })
                                                    .catch(err => {
                                                        return reject(err);
                                                    })
                                            })

                                            break;
                                        default:
                                            return reject({
                                                code: 403,
                                                msg: `You can not get more task ultil Q.A submit your current tasks!`
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

const GetTaskByJobId = (jobId) => {
    return new Promise((resolve, reject) => {
        Task
            .find({ 'basic.job': jobId })
            .then(tasks => {
                return resolve(tasks);
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not get task by job id with error: ${new Error(err.message)}`
                })
            })
    })
}


//lấy những task chưa có editor nào xử lý
const HaveJOB = (jobIds, jobLevelIds) => {
    return new Promise((resolve, reject) => {
        Task
            //lấy những task chưa có editor nào nhận
            .findOne({
                'basic.job': { $in: jobIds },
                'basic.level': { $in: jobLevelIds },
                status: -1
            })

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
                status: -1
            })
            .sort({ 'basic.deadline.end': 1 })
            .then(task => {
                if (!task) {
                    return reject({
                        code: 404,
                        msg: `No available task!`
                    })
                }
                return resolve(task);
            })
            .catch(err => {
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
                        'editor.staff': ObjectId(staffId),
                        status: { $lt: 2 }
                    }
                },
                { $group: { _id: '$basic.job' } }
            ])
            .then(jobs => {
                return resolve(jobs)
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not get jobs list wich you are processing with error: ${new Error(err.message)}`
                })
            })
    })
}
