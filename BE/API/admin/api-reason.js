const router = require('express').Router();
const Reason = require('../../models/reason-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");

router.delete('/', authenticateAdminToken, async (req, res) => {
    let reasonId = req.body.id;

    let reason = await Reason.findById(reasonId);
    if(!reason){
        return res.status(404).json({
            msg:`Canceling task reason not found!`
        })
    }

    await reason.delete()
    .then(_=>{
        return res.status(200).json({
            msg:`The canceling task reason has been deleted!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not delete canceling task reason with error: ${new Error(err.message)}`
        })
    })
    
})

router.get('/list', authenticateAdminToken, async (req, res) => {
    let reasons = await Reason.find({});
    return res.status(200).json({
        msg: `Load canceling task reasons list successfully!`,
        reasons
    })
});

router.get('/detail', authenticateAdminToken, async (req, res) => {
    let { reasonId } = req.query;
    let reason = await Reason.findById(reasonId);
    if (!reason) {
        return res.status(404).json({
            msg: `Canceling task reason not found!`
        })
    }
    return res.status(200).json({
        msg: `Get canceling task reason detail successfully!`,
        reason
    })
})


router.post('/', authenticateAdminToken, async (req, res) => {
    let { name, is_penalty, fines } = req.body;
    //ràng buộc dữ liệu cho đầu vào tên size
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'Please input reason to cancel task!'
        });
    }

    let reason = new Size({
        name,
        is_penalty,
        fines
    });

    await reason.save()
        .then(_ => {
            return res.status(201).json({
                msg: `Canceling task reason has been created!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not create new canceling task reason with error: ${new Error(err.message)}`
            })
        })


})

router.put('/', authenticateAdminToken, async (req, res) => {
    let { reasonId, name, is_penalty, fines } = req.body;

    //ràng buộc dữ liệu cho đầu vào tên size
    if (name.length == 0) {
        return res.status(403).json({
            msg: `Canceling task reason can not be empty!`
        });
    }

    let reason = await Reason.findById(reasonId);

    if (!reason) {
        return res.status(404).json({
            msg: `Canceling task reason not found!`
        })
    }

    reason.name = name;
    reason.is_penalty = penalty;
    reason.fines = fines;

    await reason.save()
        .then(_ => {
            return res.status(200).json({
                msg: `Canceling task reason has been updated!`
            })
        })
        .catch(err => {
            return res.status(500).json({
                msg: `Can not update canceling task reason with error: ${new Error(err.message)}`
            })
        })
})

module.exports = router;