const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const User = require('../../models/user-model');
const UserModule = require('../../models/user-module-model');
const Module = require('../../models/module-model');
const Wage = require('../../models/wage-model');
const StaffJobLevel = require('../../models/staff-job-level-model');


const _EDITOR = 'EDITOR';
const _QA = 'QA';


/*
    Hàm load danh sách Editor dựa vào module đã set quyền nhân viên
    Chỉ load những nhân viên Editor có trạng thái hoạt động is_active:true
    và có staff-job-level tương ứng với joblevel id được truyền vào từ view
*/
router.get('/list-editor', authenticateTLAToken, (req, res) => {
    let { levelId } = req.query;
    StaffJobLevel
    .find({job_lv:levelId})
    .exec()
    .then(sjl=>{
        
        let staffLevels = sjl.map(x=>{
            return x.staff_lv
        })
        
        getModuleId(_EDITOR)
        .then(result => {
            UserModule
                .find({ module: result.m._id })
                .exec()
                .then(um => {
                    let umList = um.map(x => {
                        return x.user._id
                    });

                    User
                        .find({ 
                            _id: { $in: umList }, 
                            user_level:{$in: staffLevels},
                            is_active: true 
                        })
                        .select('fullname username')
                        .exec()
                        .then(editors => {
                            return res.status(200).json({
                                msg: `Load editors list successfully!`,
                                editors
                            })
                        })
                        .catch(err => {
                            return res.status(500).json({
                                msg: `Can not load editors list with error: ${new Error(err.message)}`
                            })
                        })
                })
                .catch(err => {
                    return res.status(500).json({
                        msg: `Can not load user module with error: ${new Error(err.message)}`
                    })
                })
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not load staff job level with job id: ${new Error(err.message)}`
        })
    })

 
})

/*
    Hàm load danh sách Q.A dựa vào module đã set quyền nhân viên
    Chỉ load những nhân viên Q.A có trạng thái hoạt động is_active:true
   
*/

router.get('/list-qa', authenticateTLAToken, (req, res) => {  

    let { levelId } = req.query;    

    StaffJobLevel
    .find({job_lv:levelId})
    .exec()
    .then(sjl=>{
        
        let staffLevels = sjl.map(x=>{
            return x.staff_lv
        })

      
        
        getModuleId(_QA)
        .then(result => {
           
            UserModule
                .find({ module: result.m._id })
                .exec()
                .then(um => {

                    let umList = um.map(x => {
                        return x.user._id
                    });

                    User
                        .find({ 
                            _id: { $in: umList }, 
                            user_level:{$in: staffLevels},
                            is_active: true 
                        })
                        .select('fullname username')
                        .exec()
                        .then(qas => {
                            return res.status(200).json({
                                msg: `Load Q.As list successfully!`,
                                qas
                            })
                        })
                        .catch(err => {
                            return res.status(500).json({
                                msg: `Can not load Q.As list with error: ${new Error(err.message)}`
                            })
                        })
                })
                .catch(err => {
                    return res.status(500).json({
                        msg: `Can not load user module with error: ${new Error(err.message)}`
                    })
                })
        })
    })
    .catch(err=>{
        return res.status(500).json({
            msg:`Can not load staff job level with job id: ${new Error(err.message)}`
        })
    })
})




module.exports = router;

const getModuleId = (moduleName) => {
    return new Promise((resolve, reject) => {
        Module.findOne({ name: moduleName })
            .exec()
            .then(m => {
                if (!m) {
                    return reject({
                        code: 404,
                        msg: `Module not found`
                    })
                }
                return resolve({
                    msg: `Module found!`,
                    m
                })
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not get module with error: ${new Error(err.message)}`
                })
            })
    })
}


