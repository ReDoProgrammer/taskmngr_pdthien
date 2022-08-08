const router = require('express').Router();
const Combo = require('../../models/combo-model');
const Job = require('../../models/job-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");


router.get('/list-lines', authenticateAdminToken, async (req, res) => {
    let { combo } = req.query;
    let cb = await Combo.findById(combo)     
        .populate('lines.mapping');
    if (!cb) {
        return res.status(404).json({
            msg: `Combo not found!`
        })
    }
    return res.status(200).json({
        msg: `Load combo lines successfully!`,
        lines: cb.lines
    })
})

router.get('/list', authenticateAdminToken, async (req, res) => {
    let cbs = await Combo.find({
        $or: [
            { 'applied.unlimited': true },
            { 'applied.to_date': { $gte: new Date() } }
        ]
    })
        .populate({
            path: 'lines',
            populate: {
                path: 'mapping'
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

    let count = await Job.countDocuments({cb:_id});
    if(count > 0){
        return res.status(403).json({
            msg:`Can not delete this combo cause having job based on it!`
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
    let { _id, name, description, price, from_date, to_date, unlimited } = req.body;
    let cb = await Combo.findById(_id);
    if (!cb) {
        return res.status(404).json({
            msg: `Combo not found!`
        })
    }

    cb.name = name;
    cb.description = description;
    cb.price = price;
    cb.applied.from_date = from_date;
    if (unlimited != 'true') {
        cb.applied.to_date = to_date;
    }
    cb.applied.unlimited = unlimited;


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

router.put('/push-line', authenticateAdminToken, async (req, res) => {
    let { combo, map, quantity } = req.body;

    let cb = await Combo.findById(combo);
    if (!cb) {
        return res.status(404).json({
            msg: `Combo not found!`
        })
    }

    let check = await Combo.find({
        _id:combo,
        'lines.mapping':map
    });
   
    if(check.length > 0){
        return res.status(409).json({
            msg:`This line already exists in combo!`
        })
    }

    cb.lines.push({
        mapping:map,
        quantity
    });
    await cb.save()
    .then(_=>{
        return res.status(200).json({
            msg:`The line has been push into this combo!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not push line into this combo with error: ${new Error(err.message)}`
        })
    })

   


})

router.put('/pull-line',authenticateAdminToken,async (req,res)=>{
    let {combo,lineId} = req.body;
    
    let cb = await Combo.findById(combo);
    if(!cb){
        return res.status(404).json({
            msg:`Combo not found!`
        })
    }
    cb.lines = cb.lines.filter(x=>x.mapping!=lineId);
    
    await cb.save()
    .then(_=>{
        return res.status(200).json({
            msg:`The line has been removed out of this combo!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not remove the line out of this combo with error: ${new Error(err.message)}`
        })
    })
})

router.put('/change-qty',authenticateAdminToken, async (req,res)=>{
    let {combo,lineId,quantity} = req.body;
    
    let cb = await Combo.findById(combo);
    if(!cb){
        return res.status(404).json({
            msg:`Combo not found!`
        })
    }

    let lines = cb.lines.filter(x=>x.mapping == lineId);
    if(lines.length == 0){
        return res.status(404).json({
            msg:`Combo line does not match!`
        })
    }

    if(lines[0].quantity == quantity){
        return;
    }

    lines[0].quantity = quantity;
    await cb.save()
    .then(_=>{
        return res.status(200).json({
            msg:`Line quantity has been updated!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not update line quantity with error: ${new Error(err.message)}`
        })
    })
})

router.post('/', authenticateAdminToken, async (req, res) => {
    let { name, description, price, from_date, to_date, status, unlimited } = req.body;
    let combo = new Combo({
        name,
        description,
        price
    });

    combo.applied = {
        from_date,
        unlimited,
        status
    }

    if (unlimited == 'false') {
        combo.applied.to_date = to_date;
    }

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