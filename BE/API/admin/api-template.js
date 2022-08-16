const router = require('express').Router();
const Template = require('../../models/template-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");
router.get('/',authenticateAdminToken,async (req,res)=>{
    let temps = await Template.find({}).populate('levels');
    return res.status(200).json({
        msg:`Load job templates list successfully!`,
        temps
    })
})

router.get('/detail',authenticateAdminToken,async (req,res)=>{
    let {_id} = req.query;

    let temp = await Template.findById(_id)
    .populate('levels');
    if(!temp){
        return res.status(404).json({
            msg:`Job template not found!`
        })
    }
    return res.status(200).json({
        msg:`Get job template detail successfully!`,
        temp
    })
})

router.put('/pull-child',authenticateAdminToken,async (req,res)=>{
    let {_id,level} = req.body;
    let temp = await Template.findById(_id);
    if(!temp){
        return res.status(404).json({
            msg:`Job template not found!`
        })
    }

    temp.levels.pull(level);
    
    await temp.save()
    .then(_=>{
        return res.status(200).json({
            msg:`Job level has been removed out of this job template!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not remove job level from template with error: ${new Error(err.message)}`
        })
    })
})
router.put('/push-child',authenticateAdminToken, async (req,res)=>{
    let {_id,level} = req.body;
    let temp = await Template.findById(_id);
    if(!temp){
        return res.status(404).json({
            msg:`Job template not found!`
        })
    }

    if(temp.levels.includes(level)){
        return res.status(409).json({
            msg:`This level has been already exists!`
        })
    }

    temp.levels.push(level);
    await temp.save()
    .then(_=>{
        return res.status(200).json({
            msg:`Job level has been inserted!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not add this job level with error: ${new Error(err.message)}`
        })
    })
})

router.delete('/',authenticateAdminToken, async (req,res)=>{
    let {_id} = req.body;

    let temp = await Template.findById(_id);
    if(!temp){
        return res.status(404).json({
            msg:`Job template not found!`
        })
    }

    await temp.delete()
    .then(_=>{
        return res.status(200).json({
            msg:`Job template has been deleted!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not delete this job template with caught error: ${new Error(err.message)}`
        })
    })
})
router.put('/',authenticateAdminToken,async (req,res)=>{
    let {_id,name,description} = req.body;
    let temp = await Template.findById(_id);
    if(!temp){
        return res.status(404).json({
            msg:`Job template not found!`
        })
    }
    temp.name = name;
    temp.description = description;
    temp.updated = {
        at: new Date(),
        by:req.user._id
    };
    await temp.save()
    .then(_=>{
        return res.status(200).json({
            msg:`Job template has been updated!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not update job template with error: ${new Error(err.message)}`
        })
    })
 })
router.post('/',authenticateAdminToken, async (req,res)=>{
    let {name,description} = req.body;
    let temp = new Template({
        name,
        description,
        created:{
            by:req.user._id
          
        }
    });
    await temp.save()
    .then(_=>{
        return res.status(201).json({
            msg:`Job template has been created!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not create new job template with error: ${new Error(err.message)}`
        })
    })
})
module.exports = router;