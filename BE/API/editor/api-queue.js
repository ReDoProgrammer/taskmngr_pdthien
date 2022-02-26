const router = require("express").Router();
const Queue = require('../../models/queue-model');
const { authenticateEditorToken } = require("../../../middlewares/editor-middleware");

router.post('/',authenticateEditorToken,(req,res)=>{
    let queue = new Queue({
        staff:req.user._id
    });

    queue
    .save()
    .then(_=>{
        return res.status(201).json({
            msg:`You have registed get more task successfully!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not register more task with error: ${new Error(err.message)}`
        })
    })

})

module.exports = router;