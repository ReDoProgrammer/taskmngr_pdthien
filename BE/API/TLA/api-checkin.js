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
   UserModule
   .find({module:moduleId})
   .then(um=>{
       let users = um   .map(x=>{
           return x.user;
       })
       User
       .find({_id:{$in:users}})
       .then(employees=>{
           return res.status(200).json({
               msg:`Get users based on module successfully!`,
               employees
           })
       })
       .catch(err=>{
           console.log(`Can not get users based on module with error: ${new Error(err.message)}`)
           return res.status(500).json({
               msg:`Can not get users based on module with error: ${new Error(err.message)}`
           })
       })
   })
   .catch(err=>{
       console.log(`Can not find usermodule by module id with error: ${new Error(err.message)}`)
       return res.status(500).json({
           msg:`Can not find usermodule by module id with error: ${new Error(err.message)}`
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