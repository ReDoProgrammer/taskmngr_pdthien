const Module = require('../models/module-model');
const UserModule = require('../models/user-module-model');
const Wage = require('../models/wage-model');
const User = require('../models/user-model');
const jwt = require("jsonwebtoken");

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "72h" });
}

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
    getRole,
    getModule,
    getUser,
    getWage
}
