const router = require('express').Router();
const { authenticateAdminToken } = require("../../../middlewares/middleware");
const Material = require('../../models/material-model');

router.delete('/', authenticateAdminToken, async (req, res) => {
    let {mId} = req.body;
    Material.findByIdAndDelete(mId,(err)=>{
        if(err){
            return res.status(500).json({
                msg:`Can not delete this material with error: ${new Error(err.message)}`
            })
        }

        return res.status(200).json({
            msg:`The material has been deleted!`
        })
    })
})

router.get('/list',authenticateAdminToken, async (req, res) => {
    let {search} = req.query;
   let ml = await Material.find({ "name": { "$regex": search, "$options": "i" } });

   return res.status(200).json({
       msg:`Load material list successfully!`,
       ml
   })
});

router.get('/detail', authenticateAdminToken,async (req, res) => {
    let { mId } = req.query;
    let m = await Material.findById(mId);
    if(!m){
        return res.status(404).json({
            msg:`Material not found!`
        })
    }

    return res.status(200).json({
        msg:`Load material successfully!`,
        m
    })
})


router.post('/', authenticateAdminToken, async (req, res) => {
    let { name, description, price } = req.body;
   
    let m = new Material();
    m.name = name;
    m.description = description;
    m.price = price;

    await m.save()
    .then(_=>{
        return res.status(201).json({
            msg:`Material has been created!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not create material with error: ${new Error(err.message)}`
        })
    })
   
})

router.put('/', authenticateAdminToken,async (req, res) => {
    let { mId, name, description, price } = req.body;

    let m = await Material.findById(mId);

    if(!m){
        return res.status(404).json({
            msg:`Material not found!`
        })
    }

    m.name = name;
    m.description = description;
    m.price = price;

    await m.save()
    .then(_=>{
        return res.status(200).json({
            msg:`The material has been updated!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not update sale meterial with error: ${new Error(err.message)}`
        })
    })
    
})

module.exports = router;