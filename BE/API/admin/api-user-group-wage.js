const router = require('express').Router();
const Wage = require('../../models/wage-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");


router.delete('/delete-many',authenticateAdminToken,(req,res)=>{
    let {ugId} = req.body;
    Wage
    .deleteMany({user_group:ugId})
    .exec()
    .then(_=>{
        return res.status(200).json({
            msg:`Delete wages successfully!`
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not delete these wages with error: ${new Error(err.message)}`
        })
    })
})



router.delete('/', authenticateAdminToken, (req, res) => {
    let { _id } = req.body;
    Wage.findByIdAndDelete( _id )
        .exec()
        .then(_ => {
            return res.status(200).json({
                msg: `Delete user group wage successfully!`
            })
        })
        .catch(err => {
            console.log(`Can not delete user group wages with error: ${new Error(err.message)}`);
            return res.status(500).json({
                msg: `Can not delete user group wages with error: ${new Error(err.message)}`
            })
        })
})

router.post('/', authenticateAdminToken, (req, res) => {
    let { user_group, module, level, wage } = req.body;
   console.log({ user_group, module, level, wage });
    if(wage<=0){
        return res.status(403).json({
            msg:`Wage value not valid!`
        })
    }

    Wage
        .countDocuments({ user_group, module, level })
        .then(count => {
            if (count == 0) {
                let w = new Wage({
                    user_group,
                    module,
                    level,
                    wage
                })
                w.save()
                    .then(_ => {
                        return res.status(201).json({
                            msg: `Insert user group wages successfully`
                        })
                    })
                    .catch(err => {
                        return res.status(500).json({
                            msg: `Can not insert user group wages with error: ${new Error(err.message)}`
                        })
                    })
            } else {
                return res.status(403).json({
                    msg:`This wage already exists in database!`
                })
            }
        })
        .catch(err => {
            console.log(`Can not insert a new wage with error: ${new Error(err.message)}`);
            return res.status(500).json({
                msg: `Can not insert a new wage with error: ${new Error(err.message)}`
            })
        })


})

router.put('/',authenticateAdminToken,(req,res)=>{
    
    let {_id,user_group,level,skill,wage} = req.body;
    Wage
    .findByIdAndUpdate(_id,{
        user_group,
        level,
        skill,
        wage
    },
    {new:true},
    (err,w)=>{
        if(err){
            return res.status(500).json({
                msg:`Can not update wage with error: ${new Error(err.message)}`
            })
        }
        if(!w){
            return res.status(404).json({
                msg:`Wage not found`
            })
        }
        return res.status(200).json({
            msg:`Update wage successfully!`,
            w
        })
    })
})

router.get('/', authenticateAdminToken, (req, res) => {
    let { ugId } = req.query;
    Wage.find({ user_group: ugId })
        .populate('level', 'name -_id')
        .populate('module', 'name -_id')
        .exec()
        .then(wages => {
            console.log(wages);
            return res.status(200).json({
                msg: 'Load user group wages successfully',
                wages
            })
        })
        .catch(err => {
            console.log(`Can not load user group wages with error: ${new Error(err.message)}`);
            return res.status(500).json({
                msg: `Can not load user group wages with error: ${new Error(err.message)}`
            })
        })
})

router.get('/detail',authenticateAdminToken,(req,res)=>{
    let {_id} = req.query;
    Wage
    .findById(_id)
    .exec()
    .then(w=>{
        return res.status(200).json({
            msg:`Get wage detail successfully!`,
            w
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not get wage detail with error: ${new Error(err.message)}`
        })
    })
})

module.exports = router;