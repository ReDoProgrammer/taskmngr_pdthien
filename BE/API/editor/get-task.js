const Job = require('../../models/job-model');
const Task = require('../../models/task-model');
const ObjectId = require('mongodb').ObjectId;
const _EDITOR = 'EDITOR';
const {
    getUser,
    getWage,
    GetAccessingLevels } = require('../common');

const getTask = (staffId) => {
    return new Promise((resolve, reject) => {
        //Bước 1: Lấy thông tin của user để từ đó lấy được những local job level mà user này có thể đảm nhận
        getUser(staffId)
            .then(u => {

                //Bước 2: Lấy danh sách những job mà user đang xử lý và những local job level mà user có thể đảm nhận
                Promise.all([GetProcessingJobs(staffId), GetAccessingLevels(u.user_level._id)])
                    .then(rs => {                     
                        let jobLevels = rs[1];
                        switch (rs[0].length) {
                            case 0:
                                NoJOB(jobLevels)
                                    .then(task => {
                                        getWage(staffId, _EDITOR, task.basic.level.toString())
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
                                        getWage(staffId, _EDITOR, task.basic.level.toString())
                                            .then(wage => {
                                                console.log(wage)
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
                                                    getWage(staffId, _EDITOR, task.basic.level.toString())
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
                                                    getWage(staffId, _EDITOR, task.basic.level.toString())
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
                        'editor.visible': true,
                        status: {$lte:2,$ne:-10}                        
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
