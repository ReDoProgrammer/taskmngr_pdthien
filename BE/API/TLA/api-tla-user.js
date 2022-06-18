const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const User = require('../../models/user-model');
const Group = require('../../models/user-group-model');
const Module = require('../../models/module-model');
const { ObjectId } = require('mongodb');

const _EDITOR = 'EDITOR';
const _QA = 'QA';



router.get('/list-editor', authenticateTLAToken, async (req, res) => {
    let { levelId } = req.query;
    let groups = await Group.find({job_lv:levelId});
    console.log(groups)
   


})

/*
    Hàm load danh sách Q.A dựa vào module đã set quyền nhân viên
    Chỉ load những nhân viên Q.A có trạng thái hoạt động is_active:true
   
*/

router.get('/list-qa', authenticateTLAToken, async (req, res) => {

    let { levelId } = req.query;

  

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


