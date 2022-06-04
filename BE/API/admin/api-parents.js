const router = require('express').Router();
const RootLevel = require('../../models/root-level-model');
const ParentsLevel = require('../../models/parents-level-model');
const JobLevel = require('../../models/job-level-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");



router.get('/list', authenticateAdminToken, async (req, res) => {
    let parentsList = await ParentsLevel.find({}).populate('job_levels');
    return res.status(200).json({
        msg: `Load parents list successfully!`,
        parentsList
    })
})

router.get('/list-by-root', authenticateAdminToken, async (req, res) => {
    let { rootId } = req.query;
    let parentsList = await ParentsLevel.find({ root: rootId });
    return res.status(200).json({
        msg: `Load parents list by root successfully!`,
        parentsList
    })
})

router.get('/detail', authenticateAdminToken, async (req, res) => {
    let { pId } = req.query;
    let parents = await ParentsLevel.findById(pId);
    if (!parents) {
        return res.status(404).json({
            msg: `Parents not found!`
        })
    }

    return res.status(200).json({
        msg: `Load parents detail successfully!`,
        parents
    })
})

router.post('/', authenticateAdminToken, async (req, res) => {
    let { name, description } = req.body;
    let parents = new ParentsLevel({ name, description });

    await parents.save()
        .then(_ => {
            return res.status(201).json({
                msg: `Parents level has been created!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not create new parents level with error: ${new Error(err.message)}`
            })
        })

})

router.put('/', authenticateAdminToken, async (req, res) => {
    let { pId, name, description } = req.body;
    let parents = await ParentsLevel.findById(pId);
    if (!parents) {
        return res.status(404).json({
            msg: `Parents level not found!`
        })
    }

    parents.name = name;
    parents.description = description;

    await parents.save()
        .then(_ => {
            return res.status(200).json({
                msg: `The parents level has been updated!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not update parents level with error: ${new Error(err.message)}`
            })
        })
})

router.put('/push-child', authenticateAdminToken, async (req, res) => {
    let { pId, levelId } = req.body;

    let parents = await ParentsLevel.findById(pId);
    if (!parents) {
        return res.status(404).json({
            msg: `Parents level not found!`
        })
    }

    var chk = parents.job_levels.filter(x => x == levelId);
    if (chk.length > 0) {
        return res.status(303).json({
            msg: `This job level already has set in this parents!`
        })
    }

    let jl = await JobLevel.findById(levelId);
    if (!jl) {
        return res.status(404).json({
            msg: `Job level not found!`
        })
    }

    jl.parents = pId;
    await jl.save()
        .then(async _ => {
            parents.job_levels.push(jl);
            await parents.save()
                .then(_ => {
                    return res.status(200).json({
                        msg: `Add job level into parents successfully!`
                    })
                })
                .catch(err => {
                    return res.status(500).json({
                        msg: `Can not add job level into parents level with error: ${new Error(err.message)}`
                    })
                })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not set parents into job level with error: ${new Error(err.message)}`
            })
        })

})

router.put('/pull-child',authenticateAdminToken,async (req,res)=>{
    let {pId,levelId} = req.body;

    let jl = await JobLevel.findById(levelId);
    if(!jl){
        return res.status(404).json({
            msg:`Job level not found!`
        })
    }

    let parents = await ParentsLevel.findById(pId);
    if(!parents){
        return res.status(404).json({
            msg:`Parents level not found!`
        })
    }

    jl.parents  = null;
    await jl.save()
    .then(async _=>{
        parents.job_levels.pull(jl);
        await parents.save()
        .then(_=>{
            return res.status(200).json({
                msg:`Job level has been removed from this parents level!`
            })
        })
        .catch(err=>{
            return res.status(500).json({
                msg:`Can not remove this job level from parents level with error: ${new Error(err.message)}`
            })
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not reset parents of this job level with error: ${new Error(err.message)}`
        })
    })

})

router.delete('/', authenticateAdminToken, async (req, res) => {
    let { pId } = req.body;
    let parents = await ParentsLevel.findById(pId);
    if (!parents) {
        return res.status(404).json({
            msg: `Parents level not found!`
        })
    }

    let count = await JobLevel.countDocuments({ parents: pId });
    if (count > 0) {
        return res.status(403).json({
            msg: `Can not delete parents levels when having job levels depend on it!`
        })
    }

    await parents.delete()
        .then(_ => {
            return res.status(200).json({
                msg: `The parents level has been deleted!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not delete this parents level with error: ${new Error(err.message)}`
            })
        })
})



module.exports = router;