const router = require('express').Router();
const Mapping = require('../../models/mapping-model');
const JobLevel = require('../../models/job-level-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");



router.get('/list', authenticateAdminToken, async (req, res) => {
    let map = await Mapping.find({}).populate('job_levels');
    return res.status(200).json({
        msg: `Load mapping list successfully!`,
        map
    })
})


router.get('/detail', authenticateAdminToken, async (req, res) => {
    let { mId } = req.query;
    let map = await Mapping.findById(mId);
    if (!map) {
        return res.status(404).json({
            msg: `Map not found!`
        })
    }
    return res.status(200).json({
        msg: `Load map detail successfully!`,
        map
    })
})

router.post('/', authenticateAdminToken, async (req, res) => {
    let { name, description } = req.body;
    let map = new Mapping({ name, description });

    await map.save()
        .then(_ => {
            return res.status(201).json({
                msg: `The map has been created!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not create new map with error: ${new Error(err.message)}`
            })
        })

})

router.put('/', authenticateAdminToken, async (req, res) => {
    let { mId, name, description } = req.body;
    let map = await Mapping.findById(mId);
    if (!map) {
        return res.status(404).json({
            msg: `Map not found!`
        })
    }

    map.name = name;
    map.description = description;

    await map.save()
        .then(_ => {
            return res.status(200).json({
                msg: `The map has been updated!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not update map with error: ${new Error(err.message)}`
            })
        })
})

router.put('/push-child', authenticateAdminToken, async (req, res) => {
    let { mId, levelId } = req.body;

    let map = await Mapping.findById(mId);
    if (!map) {
        return res.status(404).json({
            msg: `Map not found!`
        })
    }

    var chk = map.job_levels.indexOf(levelId);
    if (chk > -1) {
        return res.status(303).json({
            msg: `This job level already has set in this map!`
        })
    }

    let jl = await JobLevel.findById(levelId);
    if (!jl) {
        return res.status(404).json({
            msg: `Job level not found!`
        })
    }


    map.job_levels.push(jl);
    await map.save()
        .then(_ => {
            return res.status(200).json({
                msg: `Add job level into map successfully!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not add job level into map with error: ${new Error(err.message)}`
            })
        })


})

router.put('/pull-child', authenticateAdminToken, async (req, res) => {
    let { mId, levelId } = req.body;

    let jl = await JobLevel.findById(levelId);
    if (!jl) {
        return res.status(404).json({
            msg: `Job level not found!`
        })
    }

    let map = await Mapping.findById(mId);
    if (!map) {
        return res.status(404).json({
            msg: `Map not found!`
        })
    }


    map.job_levels.pull(jl);
    await map.save()
        .then(_ => {
            return res.status(200).json({
                msg: `Job level has been removed from this map!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not remove this job level from map with error: ${new Error(err.message)}`
            })
        })


})

router.delete('/', authenticateAdminToken, async (req, res) => {
    let { mId } = req.body;
    let map = await ParentsLevel.findById(mId);
    if (!map) {
        return res.status(404).json({
            msg: `Map not found!`
        })
    }

    let count = await JobLevel.countDocuments({ parents: mId });
    if (count > 0) {
        return res.status(403).json({
            msg: `Can not delete maps when having job levels depend on it!`
        })
    }

    await map.delete()
        .then(_ => {
            return res.status(200).json({
                msg: `The map has been deleted!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not delete this map with error: ${new Error(err.message)}`
            })
        })
})



module.exports = router;