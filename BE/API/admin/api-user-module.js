const router = require('express').Router();
const { authenticateAdminToken } = require("../../../middlewares/middleware");
const UserModule = require('../../models/user-module-model');


router.get('/', authenticateAdminToken, (req, res) => {
    let { moduleId } = req.query;
    UserModule
        .find({ module: moduleId })
        .populate('user','username fullname phone')
        .exec()
        .then(ums => {
            return res.status(200).json({
                msg: `Load user modules successfully!`,
                ums
            })
        })
        .catch(err => {
            console.log(`Can not load user module roles with error: ${new Error(err.message)}`);
            return res.status(500).json({
                msg: `Can not load user module roles with error: ${new Error(err.message)}`
            })
        })
})

router.post('/', authenticateAdminToken, (req, res) => {
    let { moduleId, userId } = req.body;

    UserModule
        .countDocuments({ user: userId, module: moduleId })
        .then(count => {
            if (count > 0) {
                return res.status(403).json({
                    msg: `This role already exists in database`
                })
            } else {
                let um = new UserModule();
                um.module = moduleId;
                um.user = userId;
                um.save()
                    .then(_ => {
                        return res.status(201).json({
                            msg: `Insert user module role successfully!`
                        })
                    })
                    .catch(err => {
                        console.log(`Can not insert new user module role with error: ${new Error(err.message)}`);
                        return res.status(500).json({
                            msg: `Can not insert new user module role with error: ${new Error(err.message)}`
                        })
                    })
            }
        })
})

router.delete('/',authenticateAdminToken,(req,res)=>{
    let {_id} = req.body;
    UserModule
    .findByIdAndDelete(_id)
    .then(_=>{
        return res.status(200).json({
            msg:`User module role has been deleted!`
        })
    })
    .catch(err=>{
        console.log(`Can not delete user module role with error: ${new Error(err.message)}`);
        return res.status(500).json({
            msg:`Can not delete user module role with error: ${new Error(err.message)}`
        })
    })
})






module.exports = router;