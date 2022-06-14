const router = require('express').Router();
const CustomerGroup = require('../../models/customer-group-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");


router.get('/list',authenticateAdminToken,async (req,res)=>{
    let groups = await CustomerGroup.find({});
    return res.status(200).json({
        msg:`Load customer groups list successfully!`,
        groups
    })
})

router.get('/list-combo',authenticateAdminToken,async (req,res)=>{
    let {groupId} = req.query;
    let group = await CustomerGroup.findById(groupId).populate('combos');
    if(!group){
        return res.status(404).json({
            msg:`Customer group not found`
        })
    }

    return res.status(200).json({
        msg:`Load combos list that belong to this customer group successfully!`,
        combos:group.combos
    })

})

router.get('/detail',authenticateAdminToken, async (req,res)=>{
    let {groupId} = req.query;
    let group = await CustomerGroup.findById(groupId);

    if(!group){
        return res.status(404).json({
            msg:`Customer group not found!`
        })
    }

    return res.status(200).json({
        msg:`Get customer group detail successfully!`,
        group
    })
})

router.delete('/',authenticateAdminToken,async (req,res)=>{
    let {groupId} = req.body;
    
    let group = await CustomerGroup.findById(groupId);
    if(!group){
        return res.status(404).json({
            msg:`Customer group not found!`
        })
    }

    if(group.customers.length > 0){
        return res.status(403).json({
            msg:`Can not delete this customer group cause having customers belong to it!`
        })
    }

    await group.delete()
    .then(_=>{
        return res.status(200).json({
            msg:`Customer group has been deleted!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not delete this customer group with error: ${new Error(err.message)}`
        })
    })
})

router.put('/',authenticateAdminToken,async (req,res)=>{
    let {groupId,name,description} = req.body;

    let group = await CustomerGroup.findById(groupId);

    if(!group){
        return res.status(404).json({
            msg:`Customer group not found!`
        })
    }

    group.name = name;
    group.description = description;
    group.updated = {
        at: new Date(),
        by:req.user._id
    };

    await group.save()
    .then(_=>{
        return res.status(200).json({
            msg:`Customer group has been updated!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not update customer group with error: ${new Error(err.message)}`
        })
    })
})

router.put('/push-combo',authenticateAdminToken,async (req,res)=>{
    let {combo,groupId} = req.body;
    let group = await CustomerGroup.findById(groupId);
    if(!group){
        return res.status(404).json({
            msg:`Customer group not found!`
        })
    }

    if(group.combos.includes(combo)){
        return res.status(409).json({
            msg:`The combo already applied to this group`
        })
    }

    group.combos.push(combo);
    await group.save()
    .then(_=>{
        return res.status(200).json({
            msg:`Combo has been added into this group!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not add this combo to customer group with error: ${new Error(err.message)}`
        })
    })
})

router.put('/pull-combo',authenticateAdminToken, async (req,res)=>{
    let {combo,groupId} = req.body;

    let group = await CustomerGroup.findById(groupId);
    if(!group){
        return res.status(404).json({
            msg:`Customer group not found!`
        })
    }

    if(!group.combos.includes(combo)){
        return res.status(404).json({
            msg:`Combo is not belongs to this customer group!`
        })
    }

    group.combos.pull(combo);
    await group.save()
    .then(_=>{
        return res.status(200).json({
            msg:`The combo has been removed from this customer group!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not remove combo from this customer group with error: ${new Error(err.message)}`
        })
    })
})



router.post('/',authenticateAdminToken,async (req,res)=>{
    let {name,description} = req.body;
    let group = new CustomerGroup({name,description});
    group.created = {
        by:req.user._id
    };

    await group.save()
    .then(_=>{
        return res.status(201).json({
            msg:`Customer group has been created!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not create new customer group with error: ${new Error(err.message)}`
        })
    })
})

module.exports = router;