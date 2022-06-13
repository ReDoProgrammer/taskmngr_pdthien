const router = require('express').Router();
const ComboLine = require('../../models/combo-line-model');
const Combo = require('../../models/combo-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");



router.get('/list', authenticateAdminToken,async (req, res) => {
    let { cb } = req.query;
    let lines = await ComboLine.find({cb})
    .populate('root')
    .populate('parents');

    return res.status(200).json({
        msg:`Load comboline by combo successfully!`,
        lines
    })
})

router.get('/detail', authenticateAdminToken, (req, res) => {
    let { _id } = req.query;
    ComboLine
        .findById(_id)
        .exec()
        .then(cbl => {
            if (!cbl) {
                return res.status(404).json({
                    msg: `Comboline not found!`
                })
            }

            return res.status(200).json({
                msg: `Get comboline detail successfully!`,
                cbl
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not get comboline detail with error: ${new Error(err.message)}`
            })
        })
})

router.delete('/delete-many', authenticateAdminToken, (req, res) => {
    let { comboId } = req.body;//lấy id của combo
    console.log(comboId);
    // ComboLine
    // .deleteMany({cb:comboId},err=>{
    //     if(err){
    //         return res.status(500).json({
    //             msg:`Can not delete comboline based on combo id with error: ${new Error(err.message)}`
    //         })
    //     }

    //     return res.status(200).json({
    //         msg:`Delete Combo and lines based on it successfully!`
    //     })
    // })
})

router.delete('/', authenticateAdminToken, (req, res) => {
    let { _id } = req.body;
    ComboLine
        .findByIdAndDelete(_id)
        .exec()
        .then(cbl => {
            if (!cbl) {
                return res.status(404).json({
                    msg: `Comboline not found!`
                })
            }
            return res.status(200).json({
                msg: `Comboline has been deleted!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not delete this comboline with error: ${new Error(err.message)}`
            })
        })
})

router.put('/', authenticateAdminToken, (req, res) => {
    let { _id, cb, lv, qty } = req.body;
    ComboLine
        .findByIdAndUpdate(_id,
            {
                cb, lv, qty
            }, { new: true }, (err, cbl) => {
                if (err) {
                    return res.status(500).json({
                        msg: `Can not update comboline with error: ${new Error(err.message)}`
                    })
                }

                if (!cbl) {
                    return res.status(404).json({
                        msg: `Comboline not found!`
                    })
                }

                return res.status(200).json({
                    msg: `Comboline has been updated!`,
                    cbl
                })
            })
})

router.post('/', authenticateAdminToken, async (req, res) => {
    let { combo, level, quantity, divided } = req.body;

    let cb = await Combo.findById(combo);
    if (!cb) {
        return res.status(404).json({
            msg: `Combo not found!`
        })
    }

    var chk = await ComboLine.countDocuments({
        $or: [
            { cb: combo, parents: level },
            { cb: combo, root: level }
        ]
    });
    if (chk > 0) {
        return res.status(409).json({
            msg: `This line already exists in combo!`
        })
    }

    let cbl = new ComboLine();
    cbl.cb = combo;
    if (divided == 'true') {
        cbl.parents = level;
    } else {
        cbl.root = level;
    }
    cbl.qty = quantity;

    await cbl.save()
        .then(async _ => {
            cb.lines.push(cbl);
            await cb.save()
                .then(_ => {
                    return res.status(201).json({
                        msg: `Comboline has been added!`
                    })
                })
                .catch(err => {
                    return res.status(500).json({
                        msg: `Can not add comboline into combo with error: ${new Error(err.message)}`
                    })
                })
        })
        .catch(err=>{
            return res.status(500).json({
                msg:`Can not create new comboline with error: ${new Error(err.message)}`
            })
        })

})

module.exports = router;