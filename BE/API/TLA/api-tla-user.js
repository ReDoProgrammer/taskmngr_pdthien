const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const User = require('../../models/user-model');
const UserModule = require('../../models/user-module-model');
const Module = require('../../models/module-model');
const Wage = require('../../models/wage-model');
const StaffJobLevel = require('../../models/staff-job-level-model');


const _EDITOR = 'EDITOR';
const _QA = 'QA';



router.get('/list-editor', authenticateTLAToken, async (req, res) => {
    let { levelId } = req.query;
    getModuleByName(_EDITOR)
        .then(async m => {
            let wages = await Wage.find({
                module: m._id,
                job_lv: levelId
            });
            if (wages.length == 0) {
                return res.status(403).json({
                    msg: `Can not find any editor who can process this job level. Please set wage to continue!`
                })
            }

            let sls = wages.map(x => x.staff_lv);
            let sgs = wages.map(x => x.user_group);
            let editors = await User.find({
                user_group: { $in: sgs },
                user_level: { $in: sls }
            }).select("fullname username");
            if (editors.length == 0) {
                return res.status(404).json({
                    msg: `No editor found to acc this job level. Please set wage to continue!`
                })
            }
            return res.status(200).json({
                msg:`Load editors list successfully!`,
                editors
            })
        })
        .catch(err => {
            return res.status(err.code).json({
                msg: err.msg
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
        .find({ job_lv: levelId })
        .exec()
        .then(sjl => {

            let staffLevels = sjl.map(x => {
                return x.staff_lv
            })



            getModuleByName(_QA)
                .then(m => {

                    UserModule
                        .find({ module: m._id })
                        .exec()
                        .then(um => {

                            let umList = um.map(x => {
                                return x.user._id
                            });

                            User
                                .find({
                                    _id: { $in: umList },
                                    user_level: { $in: staffLevels },
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
        .catch(err => {
            return res.status(500).json({
                msg: `Can not load staff job level with job id: ${new Error(err.message)}`
            })
        })
})




module.exports = router;

const getModuleByName = (moduleName) => {
    return new Promise(async (resolve, reject) => {
        await Module.findOne({ name: moduleName })
            .then(m => {
                if (!m) {
                    return reject({
                        code: 404,
                        msg: `Module not found`
                    })
                }
                return resolve(m);
            })
            .catch(err => {
                return reject({
                    code: 500,
                    msg: `Can not find module with error: ${new Error(err.message)}`
                })
            })
    })
}


