const router = require('express').Router();
const RootLevel = require('../../models/root-level-model');
const ParentsLevel = require('../../models/parents-level-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");



router.get('/',authenticateAdminToken,async (req,res)=>{
    let parentsList = await ParentsLevel.find({});
    return res.status(200).json({
        msg:`Load parents list successfully!`,
        parentsList
    })
})

router.get('/list-by-root',authenticateAdminToken,async (req,res)=>{
    let {rootId} = req.query;
    let parentsList = await ParentsLevel.find({root:rootId});
    return res.status(200).json({
        msg:`Load parents list by root successfully!`,
        parentsList
    })
})

router.get('/detail',authenticateAdminToken,async (req,res)=>{
    let {pId} = req.query;
    let parents = await ParentsLevel.findById(pId);
    if(!parents){
        return res.status(404).json({
            msg:`Parents not found!`
        })
    }

    return res.status(200).json({
        msg:`Load parents detail successfully!`,
        parents
    })
})

router.post('/',authenticateAdminToken,async (req,res)=>{
    let {name,description,rootId} = req.body;

    let root = await RootLevel.findById(rootId);
    if(!root){
        return res.status(404).json({
            msg:`Root level not found!`
        })
    }

    let parents = new ParentsLevel();
    parents.name = name;
    parents.description = description;
    parents.root = rootId;

    await parents.save()
    .then(async _=>{
       root.parents.append(parents);
       await root.save()
       .then(_=>{
           return res.status(201).json({
               msg:`Parents level has been created!`
           })
       })
       .catch(err=>{
           return res.status(500).json({
               msg:`Can not push parents level into own root level with error: ${new Error(err.message)}`
           })
       })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not create new parents level with error: ${new Error(err.message)}`
        })
    })
})

router.put('/',authenticateAdminToken,async (req,res)=>{
    
})

router.delete('/',authenticateAdminToken,async (req,res)=>{

})

module.exports = router;