const Job = require('../../models/job-model');
const Task = require('../../models/task-model');
const ObjectId = require('mongodb').ObjectId;
const _QA = 'QA';
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
                                        getWage(staffId, _QA, task.basic.level.toString())
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
                                        getWage(staffId, _QA, task.basic.level.toString())
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
                                                    getWage(staffId, _QA, task.basic.level.toString())
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
                                                    getWage(staffId, _QA, task.basic.level.toString())
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

//lấy những task chưa có qa nào xử lý
const HaveJOB = (jobIds, jobLevelIds) => {

    return new Promise((resolve, reject) => {
        Task
            //lấy những task chưa có qa nào nhận
            .findOne({
                'basic.job': { $in: jobIds },              
                status: 1// đã được editor submit
            })
            .or([
                { qa: { $size: 0 } },
                { 'qa.unregisted': true },
                { 'qa.visible': false }
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
                console.log(`HAVE JOB. Can not get initial task in jobs list with error: ${new Error(err.message)}`);
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
                { 
                    qa: { $size: 0 },
                    dc:{$size:0} 
                },               
                { 'qa.visible': false }
            ])
            .sort({ 'basic.deadline.end': 1 })
            .then(task => {
                if (!task) {
                    return reject({
                        code: 404,
                        msg: `No available task!`
                    })
                }
                if (task.qa.length > 0 && task.qa[task.qa.length - 1].unregisted == false) {
                    return reject({
                        code: 403,
                        msg: `Task has been processing by another Q.A!`
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
                        status: 1,
                        'qa.unregisted': false,// task có trạng thái unregisted = false <=> đang xử lý,
                        'qa.visible': true
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
