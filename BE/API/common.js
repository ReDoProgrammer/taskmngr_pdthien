const Module = require('../models/module-model');
const UserModule = require('../models/user-module-model');
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


module.exports = {
    generateAccessToken,
    getRole,
    getModule
}
