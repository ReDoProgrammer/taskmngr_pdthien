const Module = require('../models/module-model');
const UserModule = require('../models/user-module-model');
const Wage = require('../models/wage-model');
const User = require('../models/user-model');
const jwt = require("jsonwebtoken");
const Task = require('../models/task-model');
const StaffJobLevel = require('../models/staff-job-level-model');


function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "72h" });
}


//hàm trả về danh sách staff level id
const getStaffsFromJobLevel = (jobLevelId)=>{
    return new Promise((resolve,reject)=>{
        StaffJobLevel
        .find({job_lv:jobLevelId})
        .exec()
        .then(sjl=>{
            let staff_levels = sjl.map(x=>{
                return x.staff_lv;
            })
            if(staff_levels.length == 0){
                return reject({
                    code:404,
                    msg:`Can not get staff levels from joblevel id`
                })
            }

            User
            .find({user_level:{$in:staff_levels}})
            .exec()
            .then(users=>{
                if(users.length == 0){
                    return reject({
                        code:401,
                        msg:`Can not find any user from staff levels list`
                    })
                }

                return resolve(users);
            })
            .catch(err=>{
                return reject({
                    code:500,
                    msg:`Can not get users list from staff levels id array with error: ${new Error(err.message)}`
                })
            })
        })
        .catch(err=>{
            return reject({
                code:500,
                msg:`Can not get staff job level from joblevel id with error: ${new Error(err.message)}`
            })
        })
    })
}



//hàm dùng để gán hoặc nhận task
const assignOrTakeTask = (moduleName,taskId,jobLevelId,staffId,is_assigned)=>{
    return new Promise((resolve,reject)=>{
        getModule(moduleName)
        .then(result=>{          
            getWage(staffId,jobLevelId,result.mod._id)
            .then(rs=>{
                console.log(rs);
                Task
                .findByIdAndUpdate(taskId,{
                    editor:staffId,
                    editor_wage: rs.w.wage,
                    editor_assigned:is_assigned,
                    status:0,

                },
                {new:true},(err,task)=>{
                    if(err){
                        return reject({
                            code:500,
                            msg:`Can not assign or take task with error: ${new Error(err.message)}`
                        })
                    }

                    if(!task){
                        return reject({
                            code:404,
                            msg:`Task not found so can not assign or take task!`
                        })
                    }
                    return resolve(task);
                })

            })
            .catch(err=>{
                console.log(err);
                return reject(err);
            })
        })
        .catch(err=>{
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
const getModule = (_module)=>{
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
                return resolve({
                    msg: `Module found`,
                    mod
                })
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

const getWage = (staffId, job_lv, moduleId) => {
    return new Promise((resolve, reject) => {
        getUser(staffId)
        .then(result=>{
            Wage
            .findOne({
                module:moduleId,
                job_lv,
                staff_lv:result.u.user_level,
                user_group:result.u.user_group
            })
            .exec()
            .then(w=>{
               if(!w){
                   return reject({
                       code:404,
                       msg:`Can not get wage with this job level and this user group. Please set this wage in user group module first!`
                   })
               }
               return resolve({
                   code:200,
                   msg:`Get wage successfully!`,
                   w
               })
            })
            .catch(err=>{
                console.log(`Can not get wage with error: ${new Error(err.message)}`);
                return reject({
                    code:500,
                    msg:`Can not get wage with error: ${new Error(err.message)}`
                })
            })
        })
        .catch(err=>{
            return reject(err)
        })
    })
}

//hàm trả về nhân viên từ mã nhân viên
const getUser = (staffId)=>{
    return new Promise((resolve,reject)=>{
        User
        .findById(staffId)
        .exec()
        .then(u=>{
            if(!u){
                return reject({
                    code:404,
                    msg:`Staff not found`
                })
            }
            return resolve({
                code:200,
                msg:`Staff found`,
                u
            })
        })
        .catch(err=>{
            return reject({
                code:500,
                msg:`Can not get staff info with error: ${new Error(err.message)}`
            })
        })
    })
}



module.exports = {
    generateAccessToken,  
    assignOrTakeTask,
    getStaffsFromJobLevel    
}
