const router = require('express').Router();
const { authenticateAdminToken } = require("../../../middlewares/middleware");
const BonusPenalty = require('../../models/bonus-penalty-model');



router.get('/detail', authenticateAdminToken, async (req, res) => {
    let { bpId } = req.query;
    let bp = await BonusPenalty.findById(bpId);

    if(!bp){
        return res.status(404).json({
            msg:`Bonus penalty not found!`
        })
    }

    return res.status(200).json({
        msg:`Get bonus penalty detail successfully!`,
        bp
    })
})

router.get('/list', authenticateAdminToken, async (req, res) => {
    let bps = await BonusPenalty.find({});
    return res.status(200).json({
        msg: `Load bonus penalties list successfully!`,
        bps
    })

})

router.delete('/', authenticateAdminToken, async (req, res) => {
    let { pId } = req.body;
    let bp = await BonusPenalty.findById(pId);

    if (!bp) {
        return res.status(404).json({
            msg: `Bonus penalty not found!`
        })
    }


    await bp.delete()
        .then(_ => {
            return res.status(200).json({
                msg: `Bonus penalty has been deleted!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not delete this bonus penalty with error: ${new Error(err.message)}`
            })
        })
})

router.put('/', authenticateAdminToken, async (req, res) => {
    let { bpId, name, description, is_bonus, costs } = req.body;

    let bp = await BonusPenalty.findById(bpId);
    if (!bp) {
        return res.status(404).json({
            msg: `Bonus or penalty not found!`
        })
    }

    bp.name = name;
    bp.description = description;
    bp.is_bonus = is_bonus;
    bp.costs = costs;
    bp.updated = {
        at: new Date(),
        by: req.user._id
    };

    await bp.save()
        .then(_ => {
            return res.status(200).json({
                msg: is_bonus == 'true' ? `Bonus has been updated` : `Penalty has been updated!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not update bonus or penalty with error: ${new Error(err.message)}`
            })
        })


})

router.post('/', authenticateAdminToken, async (req, res) => {
    let { name, description, is_bonus, costs } = req.body;
    let bp = new BonusPenalty({
        name,
        description,
        is_bonus,
        costs,
        created: {
            by: req.user._id
        }
    });

    await bp.save()
        .then(_ => {
            return res.status(201).json({
                msg: is_bonus == 'true' ? `Bonus has been created!` : 'Penalty has been created!'
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not create bonus penalty with error: ${new Error(err.message)}`
            })
        })

})


module.exports = router;