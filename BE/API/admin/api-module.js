const router = require('express').Router();
const Module = require('../../models/module-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");


router.get('/detail',authenticateAdminToken,(req,res)=>{
    let {moduleId} = req.query;
    Module.findById(moduleId)
    .exec()
    .then(module =>{
        return res.status(200).json({
            msg:`Load module detail successfully!`,
            module
        })
    })
    .catch(err=>{
        console.log(`Can not get module detail with error: ${new Error(err.message)}`);
        return res.status(500).json({
            msg:`Can not get module detail with error: ${new Error(err.message)}`
        })
    })
})

router.get('/list-staff',authenticateAdminToken,async (req,res)=>{
    let {moduleId} = req.query;
    let module = await Module.findById(moduleId).populate('users');
    if(!module){
        return res.status(404).json({
            msg:`Module not found!`
        })
    }
    return res.status(200).json({
        msg:`Load staffs list that access this module successfully!`,
        staffs: module.users
    })
})

router.get('/list',authenticateAdminToken, (req, res) => {
    Module
        .find({name:{$ne:'ADMIN'}})
        .exec()
        .then(modules => {
            return res.status(200).json({
                msg: `Load modules list successfully!`,
                modules
            })
        })
        .catch(err => {
            console.log( `Can not load modules list with error: ${new Error(err.message)}`);

            return res.status(500).json({
                msg: `Can not load modules list with error: ${new Error(err.message)}`
            })
        })
});


router.get('/list-appling-wage',authenticateAdminToken,(req,res)=>{
    Module
    .find({appling_wage:true})
    .exec()
    .then(ms=>{       
        return res.status(200).json({
            msg:`Load appling modules successfully!`,
            ms
        })
    })
    .catch(err=>{
        console.log(`Can not load appling modules with error: ${new Error(err.message)}`);
        return res.status(500).json({
            msg:`Can not load appling modules with error: ${new Error(err.message)}`
        })
    })
})


router.post('/', authenticateAdminToken, (req, res) => {
    let { name, description } = req.body;
    let module = new Module();
    module.name = name;
    module.description = description;
    module
        .save()
        .then(_ => {
            return res.status(201).json({
                msg: `Module has been created!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Create module failed with error: ${new Error(err.message)}`
            })
        })
})

router.put('/', authenticateAdminToken, (req, res) => {
    let { moduleId, name, description, status } = req.body;
    Module
        .findByIdAndUpdate(
            { _id: moduleId },
            {
                name,
                description,
                status
            },
            { new: true },
            (err, module) => {
                if (err) {
                    return res.status(500).json({
                        msg: `Can not update module with error: ${new Error(err.message)}`
                    })
                }
                if (!module) {
                    return res.status(404).json({
                        msg: `Module not found!`
                    })
                }
                return res.status(200).json({
                    msg: `Update module successfully!`,
                    module
                })
            }
        )
})

router.put('/push-staff',authenticateAdminToken,async (req,res)=>{
    let { moduleId, userId} = req.body;
    let module = await Module.findById(moduleId);
    if(!module){
        return res.status(404).json({
            msg:`Module not found!`
        })
    }

    if(!module.users.includes(userId)){
        module.users.push(userId);
        await module.save()
        .then(_=>{
            return res.status(200).json({
                msg:`Staff has been add into this module`
            })
        })
        .catch(err=>{
            return res.status(500).json({
                msg:`Can not add staff into module with error: ${new Error(err.message)}`
            })
        })
    }else{
        return res.status(303).json({
            msg:`This staff already access this module!`
        })
    }
})

router.put('/pull-staff',authenticateAdminToken, async (req,res)=>{
    let { moduleId, staffId} = req.body;
    let module = await Module.findById(moduleId);
    if(!module){
        return res.status(404).json({
            msg:`Module not found!`
        })
    }
    module.users.pull(staffId);
    await module.save()
    .then(_=>{
        return res.status(200).json({
            msg:`Staff has been removed from module!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not remove staff from module with error: ${new Error(err.message)}`
        })
    })
})

module.exports = router;