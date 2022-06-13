const router = require('express').Router();
const Size = require('../../models/size-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");

router.delete('/', authenticateAdminToken,async (req, res) => {
    let id = req.body.id;
    let size = await Size.findById(id);
    if(!size){
        return res.status(404).json({
            msg:`Size not found!`
        })
    }

    await size.delete()
    .then(_=>{
        return res.status(200).json({
            msg:`The size has been deleted!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not delete this size with error: ${new Error(err.message)}`
        })
    })
})

router.get('/', async (req, res) => {
    let sizes = await Size.find({});
    return res.status(200).json({
        msg:`Load sizes list successfully!`,
        sizes
    })
});

router.get('/detail', authenticateAdminToken, async (req, res) => {
    let { id } = req.query;
    let size = await Size.findById(id);
    if(!size){
        return res.status(404).json({
            msg:`Size not found!`
        })
    }

    return res.status(200).json({
        msg:`Load size detail successfully!`,
        size
    })
})


router.post('/', authenticateAdminToken, async (req, res) => {
    let { name, description } = req.body;
    //ràng buộc dữ liệu cho đầu vào tên size
    if (name.length == 0) {
        return res.status(403).json({
            msg: 'Size name can not be blank!'
        });
    }

    let size = new Size({
        name,
        description
    });

    await size.save()
    .then(_=>{
        return res.status(201).json({
            msg:`Size has been created!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not create new size with error: ${new Error(err.message)}`
        })
    })

    
})

router.put('/', authenticateAdminToken,async (req, res) => {
    let { id, name, description } = req.body;

    //ràng buộc dữ liệu cho đầu vào tên size
    if (name.length == 0) {
        return res.status(403).json({
            msg: `Size nam can not be blank!`
        });
    }

    let size = await Size.findById(id);
    if(!size){
        return res.status(404).json({
            msg:`Size not found!`
        })
    }

    size.name =name;
    size.description = description;

    await size.save()
    .then(_=>{
        return res.status(200).json({
            msg:`Size has been updated!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not update size with error: ${new Error(err.message)}`
        })
    })


    
})

module.exports = router;