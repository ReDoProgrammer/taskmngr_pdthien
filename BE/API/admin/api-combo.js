const router = require('express').Router();
const Combo = require('../../models/combo-model');
const ComboLine = require('../../models/combo-line-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");



router.get('/list', authenticateAdminToken, async (req, res) => {
    let cbs = await Combo.find({})
        .populate({
            path: 'lines',
            populate: {
                path: 'root'
            }
        })
        .populate({
            path: 'lines',
            populate: {
                path: 'parents'
            }
        });

    return res.status(200).json({
        msg: `Load combo list successfully!`,
        cbs
    })
})

router.get('/detail', authenticateAdminToken, async (req, res) => {
    let { _id } = req.query;
    let combo = await Combo.findById(_id);
    if (!combo) {
        return res.status(404).json({
            msg: `Combo not found!`
        })
    }

    return res.status(200).json({
        msg: `Get combo detail successfully!`,
        combo
    })
})


router.delete('/', authenticateAdminToken, async (req, res) => {
    let { _id } = req.body;

    let cb = await Combo.findById(_id);
    if (!cb) {
        return res.status(404).json({
            msg: `Combo not found!`
        })
    }
    if (cb.lines.length > 0) {
        return res.status(403).json({
            msg: `Can not delete this combo when having lines based on it!`
        })
    }

    await cb.delete()
        .then(_ => {
            return res.status(200).json({
                msg: `The combo has been deleted!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not delete this combo with error: ${new Error(err.message)}`
            })
        })
})

router.put('/', authenticateAdminToken, async (req, res) => {
    let { _id, name, description, price } = req.body;
    let cb = await Combo.findById(_id);
    if (!cb) {
        return res.status(404).json({
            msg: `Combo not found!`
        })
    }

    cb.name = name;
    cb.description = description;
    cb.price = price;

    await cb.save()
        .then(_ => {
            return res.status(200).json({
                msg: `Combo has been updated!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not update this combo with error: ${new Error(err.message)}`
            })
        })
})


router.post('/', authenticateAdminToken, async (req, res) => {
    let { name, description, price } = req.body;
    let combo = new Combo({
        name,
        description,
        price
    });

    await combo
        .save()
        .then(_ => {
            return res.status(201).json({
                msg: `The combo has been created!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not create combo with error: ${new Error(err.message)}`
            })
        })
})

module.exports = router;