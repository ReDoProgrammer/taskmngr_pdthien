const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const User = require('../../models/user-model');
const Group = require('../../models/user-group-model');
const Module = require('../../models/module-model');
const StaffLevel = require('../../models/staff-level-model');
const { ObjectId } = require('mongodb');
const { getModule } = require('../../../middlewares/common');

const _EDITOR = 'EDITOR';
const _QA = 'QA';



router.get('/list-editor', authenticateTLAToken, async (req, res) => {
    let { levelId } = req.query;

    Promise.all([getModule(_EDITOR),GetStaffLevelsFromLocalJobLevel(levelId)])
    .then(async rs=>{
        let module = rs[0];
        let staffLevels = rs[1].map(x=>x._id);

        let groups = (await Group.find({
            'wages.module':module,
            'wages.staff_lv':{$in:staffLevels},
            'wages.job_lv':levelId
        })).map(x=>x._id);

        let g = (await Group.find({
            'wages.module':module,
            'wages.staff_lv':{$in:staffLevels},
            'wages.job_lv':levelId
        }));
       
        let editors = await User.find({
            user_level:{$in:staffLevels},
            user_group:{$in:groups},
            _id: {$in:module.users}
        }).select('fullname username');

        return res.status(200).json({
            msg:`Load editors successfully!`,
            editors
        })
    })
    .catch(err=>{
        return res.status(err.code).json({
            msg:err.msg
        })
    })
})

/*
    Hàm load danh sách Q.A dựa vào module đã set quyền nhân viên
    Chỉ load những nhân viên Q.A có trạng thái hoạt động is_active:true
   
*/

router.get('/list-qa', authenticateTLAToken, async (req, res) => {

    let { levelId } = req.query;
    Promise.all([getModule(_QA),GetStaffLevelsFromLocalJobLevel(levelId)])
    .then(async rs=>{
        let module = rs[0];
        let staffLevels = rs[1].map(x=>x._id);

        let groups = (await Group.find({
            'wages.module':module,
            'wages.staff_lv':{$in:staffLevels},
            'wages.job_lv':levelId
        })).map(x=>x._id);
       
        let qas = await User.find({
            user_level:{$in:staffLevels},
            user_group:{$in:groups},
            _id: {$in:module.users}
        }).select('fullname username');

        return res.status(200).json({
            msg:`Load Q.A list successfully!`,
            qas
        })
    })
    .catch(err=>{
        return res.status(err.code).json({
            msg:err.msg
        })
    })


})




module.exports = router;



const GetStaffLevelsFromLocalJobLevel = levelId=>{
    return new Promise(async (resolve,reject)=>{
        let levels = await StaffLevel.find({levels:levelId});
        if(levels.length == 0){
            return reject({
                code:404,
                msg:`No staff level can access this job level`
            })
        }
        return resolve(levels);
    })
}