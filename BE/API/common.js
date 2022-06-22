const Module = require('../models/module-model');
const User = require('../models/user-model');
const jwt = require("jsonwebtoken");

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








module.exports = {
    generateAccessToken,
    getModule,
    checkAccount,
    getUser,
    getWage
}
