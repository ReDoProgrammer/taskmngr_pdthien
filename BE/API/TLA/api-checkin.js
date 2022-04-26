const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const CheckIn = require('../../models/staff-checkin');
const User = require('../../models/user-model');
const Module = require('../../models/module-model');
const UserModule = require('../../models/user-module-model');

router.post('/',authenticateTLAToken,(req,res)=>{
    let {staffs} = req.body;

    staffs.each(st=>{
        console.log(st)
    })
})

router.get('/list-staffs-by-module',authenticateTLAToken,(req,res)=>{
    let {moduleId} = req.query;

    GetUsersByModule(moduleId)
    .then(userIds=>{
        GetUsersInRange(userIds)
        .then(users=>{
            CheckIn
            .find({})
            .then(staffs=>{
                let out = staffs.map(x=>{
                    if(x.check.length ==0){
                        return x.staff;
                    }else{
                        if(x.check[x.check.length-1].out!==null){
                            return x.staff;
                        }
                    }
                })
                let checkOut = users.filter(x=>out.includes(x._id));
                console.log(checkOut)
            })
            .catch(err=>{
                console.log(`Can not get checkin staffs with error: ${new Error(err.message)}`);
                return res.status(500).json({
                    msg:`Can not get checkin staffs with error: ${new Error(err.message)}`
                })
            })
        })
        .catch(err=>{
            return res.status(err.code).json({
                msg:err.msg
            })
        })
    })
    .catch(err=>{
        return res.status(err.code).json({
            msg:err.msg
        })
    })
})

router.get('/list-modules',authenticateTLAToken,(req,res)=>{
    Module
    .find({name:{$ne:'ADMIN'}})
    .then(modules=>{
        return res.status(200).json({
            msg:`Load modules list successfully!`,
            modules
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not load modules list with error: ${new Error(err.message)}`
        })
    })
})


module.exports = router;

const GetUsersByModule = (moduleId)=>{
    return new Promise((resolve,reject)=>{
        UserModule
        .find({module:moduleId})
        .then(um=>{
            let users = um   .map(x=>{
                return x.user;
            });
            return resolve(users);
        })
        .catch(err=>{
            return reject({
                code:500,
                msg:`Can not get users by module id with error: ${new Error(err.message)}`
            })
        })
    })
}

const GetUsersInRange = (userIds)=>{
    return new Promise((resolve,reject)=>{
        User
       .find({_id:{$in:userIds}})
       .select('fullname username')
       .then(users=>{
          return resolve(users);
       })
       .catch(err=>{
           console.log(`Can not get users based on module with error: ${new Error(err.message)}`)
            return reject({
                code:500,
                msg:`Can not get users based on module with error: ${new Error(err.message)}`
            })
       })
    })
}