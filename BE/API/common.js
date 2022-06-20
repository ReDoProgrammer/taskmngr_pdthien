const Module = require('../models/module-model');
const User = require('../models/user-model');
const jwt = require("jsonwebtoken");
const Job = require('../models/job-model');
const Task = require('../models/task-model');
const Customer = require('../models/customer-model');

const { ObjectId } = require('mongodb');




function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "72h" });
}

const checkAccount = (username, password) => {
    return new Promise((resolve, reject) => {
        User
            .findOne({ username: username })
            .exec()
            .then(user => {
                if (!user) {
                    return reject({
                        code: 404,
                        msg: `Username not found`
                    })
                }

                if (!user.is_active) {
                    return reject({
                        code: 403,
                        msg: `Your account is banned!`
                    })
                }

                user.ComparePassword(password, function (err, isMatch) {
                    if (err) {
                        return reject({
                            code: 403,
                            msg: `Can not check password with error: ${new Error(err.message)}`
                        })
                    }
                    if (isMatch) {
                        return resolve(user);
                    } else {
                        return reject({
                            code: 403,
                            msg: 'Your password not match!'
                        })
                    }
                });



            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: new Error(err.message)
                });
            })
    })
}


const getWage = (user,_module,levelId) =>{
    return new Promise(async (resolve,reject)=>{      
        Promise.all([getModule(_module),getUser(user)] .map(p => p.catch(e => e)))       
        .then(async rs=>{
           let user = rs[1];
           let m = rs[0];
          let wages = user.user_group.wages
          .filter(
            x=>x.module==m._id.toString()
           && x.staff_lv == user.user_level.toString()
           && x.job_lv == levelId
           )

           if(wages.length == 0){
            return reject({
                code:404,
                msg:`Wage not found. Please contact your administrator to set wage first!`
            })
           }

           return resolve(wages[0].wage);
        })
        .catch(err=>{
            console.log(err)
            return reject(err);
        })
    })
}




//hàm trả về module từ tên module
const getModule = (_module) => {
    return new Promise(async (resolve, reject) => {
        let m = await Module.findOne({name:_module});
        if(!m){
            return reject({
                code:404,
                msg:`Module not found!`
            })
        }

        return resolve(m);
    })

}




//hàm trả về nhân viên từ mã nhân viên
const getUser = (staffId) => {
    return new Promise(async (resolve,reject)=>{
        let user = await User.findById(staffId)
        .populate('user_group');
        if(!user){
            return reject({
                code:404,
                msg:`User not found!`
            })
        }
        return resolve(user);
    })
}


const getCustomer = (customerId) => {
    return new Promise((resolve, reject) => {
        Customer.findById(customerId)
            .populate({
                path: 'levels',
                populate: { path: 'level' }
            })
            .populate('output', 'name')
            .populate('size', 'name')
            .populate('color', 'name')
            .populate('cloud', 'name')
            .populate('nation', 'name')
            .exec((err, customer) => {
                if (err) {
                    return reject({
                        code: 500,
                        msg: `Can not get customer by id with error: ${new Error(err.message)}`
                    });
                }
                if (!customer) {
                    return reject({
                        code: 404,
                        msg: `Customer not found!`
                    });
                }

                return resolve(customer);

            });
    })

}

const getTaskDetail = (taskId) => {
    return new Promise((resolve, reject) => {
        Task
            .findById(taskId)
            .populate([
                {
                    path: 'basic.job',
                    populate: {
                        path: 'customer'
                    }
                },
                {
                    path: 'basic.level',
                    select: 'name'
                },
                {
                    path: 'editor.staff',
                    select: 'fullname'
                },
                {
                    path: 'qa.staff',
                    select: 'fullname'
                },
                {
                    path: 'dc.staff',
                    select: 'fullname'
                },
                {
                    path: 'tla.created.by',
                    select: 'fullname'
                },
                {
                    path: 'remarks',
                    populate: {
                        path: 'user',
                        select: 'fullname'                       
                    }
                }
            ])
            .exec()
            .then(t => {
                if (!t) {
                    return reject({
                        code: 404,
                        msg: `Task not found!`
                    })
                }
                return resolve(t);
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not get task detail with error: ${new Error(err.message)}`
                })
            })

    })
}

const setJobStatus = (jobId, status, staff) => {
    return new Promise((resolve, reject) => {
        Job
            .findByIdAndUpdate(jobId, {
                status
            }, { new: true }, (err, job) => {
                if (err) {
                    return reject({
                        code: 500,
                        msg: `Can not set job status with erorr: ${new Error(err.message)}`
                    })
                }

                if (!job) {
                    return reject({
                        code: 404,
                        msg: `Job not found so can not set status!`
                    })
                }

                return resolve(job);
            })
    })
}


module.exports = {
    generateAccessToken,
    getModule,
    checkAccount,
    getCustomer,
    getTaskDetail,
    setJobStatus,
    getUser,
    getWage
}
