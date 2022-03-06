const Module = require('../models/module-model');
const UserModule = require('../models/user-module-model');
const Wage = require('../models/wage-model');
const User = require('../models/user-model');
const jwt = require("jsonwebtoken");
const Task = require('../models/task-model');
const StaffJobLevel = require('../models/staff-job-level-model');
const Customer = require('../models/customer-model');



const getJobLevelBasedOnConditons = (staffId,moduleName)=>{
    return new Promise((resolve,reject)=>{
        Promise.all([  getModule(moduleName),getUser(staffId)])      
        .then(rs=>{
            Wage
            .find({
                module: rs[0]._id,
                user_group: rs[1].user_group
            })
            .exec()
            .then(ws=>{
                let levels = ws.map(x=>{
                    return x.job_lv
                })
                return resolve(levels);
            })
            .catch(err=>{
                return reject({
                    code:500,
                    msg:`Can not get joblevel based on conditons with error: ${new Error(err.message)}`
                })
            })
        })
        .catch(err=>{
            return reject(err);
        })
    })
}


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
  
          if(!user.is_active){
            return reject({
              code:403,
              msg:`Your account is banned!`            
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
  


//hàm trả về danh sách staff level id
const getStaffsFromJobLevel = (jobLevelId) => {
    return new Promise((resolve, reject) => {
        StaffJobLevel
            .find({ job_lv: jobLevelId })
            .exec()
            .then(sjl => {
                let staff_levels = sjl.map(x => {
                    return x.staff_lv;
                })
                if (staff_levels.length == 0) {
                    return reject({
                        code: 404,
                        msg: `Can not get staff levels from joblevel id`
                    })
                }

                User
                    .find({ user_level: { $in: staff_levels } })
                    .exec()
                    .then(users => {
                        if (users.length == 0) {
                            return reject({
                                code: 401,
                                msg: `Can not find any user from staff levels list`
                            })
                        }

                        return resolve(users);
                    })
                    .catch(err => {
                        return reject({
                            code: 500,
                            msg: `Can not get users list from staff levels id array with error: ${new Error(err.message)}`
                        })
                    })
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not get staff job level from joblevel id with error: ${new Error(err.message)}`
                })
            })
    })
}



//hàm dùng để gán hoặc nhận task
const assignOrTakeTask = (moduleName, taskId, jobLevelId, staffId, is_assigned) => {
    return new Promise((resolve, reject) => {
        getModule(moduleName)
            .then(result => {
                getWage(staffId, jobLevelId, result.mod._id)
                    .then(rs => {
                        console.log(rs);
                        Task
                            .findByIdAndUpdate(taskId, {
                                editor: staffId,
                                editor_wage: rs.w.wage,
                                editor_assigned: is_assigned,
                                status: 0,

                            },
                                { new: true }, (err, task) => {
                                    if (err) {
                                        return reject({
                                            code: 500,
                                            msg: `Can not assign or take task with error: ${new Error(err.message)}`
                                        })
                                    }

                                    if (!task) {
                                        return reject({
                                            code: 404,
                                            msg: `Task not found so can not assign or take task!`
                                        })
                                    }
                                    return resolve(task);
                                })

                    })
                    .catch(err => {
                        console.log(err);
                        return reject(err);
                    })
            })
            .catch(err => {
                return reject(err)
            })
    })
}



//hàm lấy quyền truy cập module

const getRole = (moduleId, userId) => {
    return new Promise((resolve, reject) => {     
       
        UserModule.countDocuments({ user: userId, module: moduleId }, (err, count) => {
            if (err) {
                return reject({
                    code: 500,
                    msg: `Can not check user module role with error: ${new Error(err.message)}`
                })
            }
            if (count == 0) {
                return reject({
                    code: 403,
                    msg: `You can not access this module`
                })
            }
            return resolve({
                code: 200,
                msg: `You can access this module`
            })
        })



    })
}


//hàm trả về module từ tên module
const getModule = (_module) => {
    return new Promise((resolve, reject) => {
        Module.findOne({ name: _module })
            .exec()
            .then(mod => {
                if (!mod) {
                    return reject({
                        code: 404,
                        msg: `Module not found`
                    })
                }
                return resolve(mod)
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not find module with error: ${new Error(err.message)}`
                })
            })
    })

}


//hàm lấy tiền công của nhân viên

const getWage = (staffId, job_lv, moduleName) => {
    return new Promise((resolve, reject) => {

        getModule(moduleName)
            .then(md => {               
                getUser(staffId)
                    .then(u => {    
                             console.log(job_lv);
                        Wage
                            .findOne({
                                module: md._id,
                                job_lv,
                                staff_lv: u.user_level,
                                user_group: u.user_group
                            })
                            .exec()
                            .then(w => {
                               
                                if (!w) {
                                    return reject({
                                        code: 404,
                                        msg: `Can not get wage with this job level and this user group. Please set this wage in user group module first!`
                                    })
                                }
                                return resolve(w);
                            })
                            .catch(err => {
                                console.log(`Can not get wage with error: ${new Error(err.message)}`);
                                return reject({
                                    code: 500,
                                    msg: `Can not get wage with error: ${new Error(err.message)}`
                                })
                            })
                    })
                    .catch(err => {
                        return reject(err)
                    })
            })
            .catch(err => {
                return reject(err);
            })


    })
}

//hàm trả về nhân viên từ mã nhân viên
const getUser = (staffId) => {
    return new Promise((resolve, reject) => {
        User
            .findById(staffId)
            .exec()
            .then(u => {
                if (!u) {
                    return reject({
                        code: 404,
                        msg: `Staff not found`
                    })
                }
                return resolve(u)
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not get staff info with error: ${new Error(err.message)}`
                })
            })
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

                return resolve({
                    code: 200,
                    msg: `Get customer by id successfully`,
                    customer
                });

            });
    })

}



module.exports = {
    generateAccessToken,
    assignOrTakeTask,
    getStaffsFromJobLevel,
    getRole,
    getModule,
    getWage,
    checkAccount,
    getJobLevelBasedOnConditons
}
