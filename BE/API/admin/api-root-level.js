const router = require('express').Router();
const RootLevel = require('../../models/national-style-model');
const ParentsLevel = require('../../models/parents-level-model');
const JobLevel = require('../../models/job-level-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");



router.get('/',authenticateAdminToken,async (req,res)=>{
    let roots = await RootLevel.find({});
    return res.status(200).json({
        msg:`Load root levels list successfully!`,
        roots
    })
})

router.get('/',authenticateAdminToken,async (req,res)=>{
    let {rootId} = req.query;
    let root = await RootLevel.findById(rootId);
    if(!root){
        return res.status(404).json({
            msg:`Root level not found!`
        })
    }

    return res.status(200).json({
        msg:`Load root level detail successfully!`,
        root
    })
})

router.post('/',authenticateAdminToken,async (req,res)=>{
    let {name,description} = req.body;
    let root = new RootLevel({name,description});
    await root.save()
    .then(_=>{
        return res.status(201).json({
            msg:`Root level has been created!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not create new root level with error: ${new Error(err.message)}`
        })
    })
})

router.put('/',authenticateAdminToken,async (req,res)=>{
    let {rootId,name,description}  = req.body;
    let root = await RootLevel.findById(rootId);
    if(!root){
        return res.status(404).json({
            msg:`Root level not found!`
        })
    }

    root.name = name;
    root.description = description;

    await root.save()
    .then(_=>{
        return res.status(200).json({
            msg:`Root level has been updated!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not update root level with error: ${new Error(err.message)}`
        })
    })
})

router.delete('/',authenticateAdminToken,async (req,res)=>{
    let {rootId} = req.body;
    let root = await RootLevel.findById(rootId);

    if(!root){
        return res.status(404).json({
            msg:`Root level not found!`
        })
    }

    let countPL = await ParentsLevel.countDocuments({root:rootId});

    if(countPL>0){
        return res.status(403).json({
            msg:`Can not delete this root level when having parents levels based on it!`
        })
    }

    let countJL = await JobLevel.countDocuments({root:rootId});
    if(countJL > 0){
        return res.status(403).json({
            msg:`Can not delete this root level when having job levels based on it!`
        })
    }

    await root.delete()
    .then(_=>{
        return res.status(200).json({
            msg:`The root level has been deleted!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not delete this root level with error: ${new Error(err.message)}`
        })
    })



    


})

module.exports = router;