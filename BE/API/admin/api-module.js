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


router.get('/list',authenticateAdminToken, (req, res) => {
    Module
        .find({})
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

module.exports = router;