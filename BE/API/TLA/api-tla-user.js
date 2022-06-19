const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const User = require('../../models/user-model');
const Group = require('../../models/user-group-model');
const Module = require('../../models/module-model');
const { ObjectId } = require('mongodb');
const { getModule } = require('../../../middlewares/common');

const _EDITOR = 'EDITOR';
const _QA = 'QA';



router.get('/list-editor', authenticateTLAToken, async (req, res) => {
    let { levelId } = req.query;
   
    getModule(_EDITOR)
    .then(async m=>{
        let groups = await Group.findOne({
            'wages.job_lv':levelId,
            'wages.module':m._id
        }).populate('users');
        console.log(groups)
      
    })
   


})

/*
    Hàm load danh sách Q.A dựa vào module đã set quyền nhân viên
    Chỉ load những nhân viên Q.A có trạng thái hoạt động is_active:true
   
*/

router.get('/list-qa', authenticateTLAToken, async (req, res) => {

    let { levelId } = req.query;

  

})




module.exports = router;



