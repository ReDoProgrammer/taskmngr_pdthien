const router = require('express').Router();
const Template = require('../../models/template-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");

router.get('/list',authenticateAdminToken,async (req,res)=>{
    let templates = await Template.find({});
    return res.status(200).json({
        msg:`Load templates list successfully!`,
        templates
    })
})

router.get('/detail',authenticateAdminToken,async (req,res)=>{
    let {tempId} = req.query;
    let temp = await Template.findById(tempId);
    if(!temp){
        return res.status(404).json({
            msg:`Template not found!`
        })
    }

    return res.status(200).json({
        msg:`Load template detail successfully!`,
        temp
    })
})

router.post('/',authenticateAdminToken,async (req,res)=>{
    let {name,description} = req.body;
    let temp = new Template({name,description});
    await temp.save()
    .then(_=>{
        return res.status(201).json({
            msg:`Template has been created!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not create new template with error: ${new Error(err.message)}`
        })
    })
})

router.put('/',authenticateAdminToken,async (req,res)=>{
    let {tempId,name,description} = req.body;
    let temp = await Template.findById(tempId);
    if(!temp){
        return res.status(404).json({
            msg:`Template not found!`
        })
    }

    temp.name = name;
    temp.description = description;
    await temp.save()
    .then(_=>{
        return res.status(200).json({
            msg:`The template has been updated!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not update template with error: ${new Error(err.message)}`
        })
    })
})

router.delete('/',authenticateAdminToken,async (req,res)=>{
    let {tempId} = req.body;
    let temp = await Template.findById(tempId);
    if(!temp){
        return res.status(404).json({
            msg:`Template not found!`
        })
    }

    await temp.delete()
    .then(_=>{
        return res.status(200).json({
            msg:`Template has been deleted!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not delete template with error: ${new Error(err.message)}`
        })
    })
})

module.exports = router;