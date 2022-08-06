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
    /*
        Q.A ngoài chức năng xử lý q.a task
        Còn có thể đảm nhận được edit task nếu đc TLA assign khi tạo task
        => trong module Q.A cần có thêm tab để edit task.
        Q.A không thể q.a task (get task) mà trước đó đã được TLA giao cho edit
        => trong chức năng load editor ngoài load editor có level phù hợp với task level, 
        cần load thêm những q.a có level phù hợp với task level 
        
    */
    Promise.all([getModule(_EDITOR), getModule(_QA), GetStaffLevelsFromLocalJobLevel(levelId)])
        .then(async rs => {

            let mEditor = rs[0];
            let mQA = rs[1];
            let staffLevels = rs[2].map(x => x._id);

            let eGroups = (await Group.find({
                'wages.module': mEditor,
                'wages.staff_lv': { $in: staffLevels },
                'wages.job_lv': levelId
            })).map(x => x._id);

            let qGroups = (await Group.find({
                'wages.module': mQA,
                'wages.staff_lv': { $in: staffLevels },
                'wages.job_lv': levelId
            })).map(x => x._id);

            //load ds editor từ cả 2 group editor và q.a
            let groups = eGroups.concat(qGroups);

            let editors = await User.find({
                user_level: { $in: staffLevels },
                user_group: { $in: groups },
                $or: [
                    { _id: { $in: mQA.users } },
                    { _id: { $in: mEditor.users } },
                ],
                is_active:true

            }).select('fullname username');


            return res.status(200).json({
                msg: `Load editors successfully!`,
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

router.get('/list-qa', authenticateTLAToken, async (req, res) => {

    let { levelId } = req.query;
    Promise.all([getModule(_QA), GetStaffLevelsFromLocalJobLevel(levelId)])
        .then(async rs => {
            let module = rs[0];
            let staffLevels = rs[1].map(x => x._id);

            let groups = (await Group.find({
                'wages.module': module,
                'wages.staff_lv': { $in: staffLevels },
                'wages.job_lv': levelId
            })).map(x => x._id);

            let qas = await User.find({
                user_level: { $in: staffLevels },
                user_group: { $in: groups },
                _id: { $in: module.users },
                is_active:true
            }).select('fullname username');

            return res.status(200).json({
                msg: `Load Q.A list successfully!`,
                qas
            })
        })
        .catch(err => {
            return res.status(err.code).json({
                msg: err.msg
            })
        })


})




module.exports = router;



const GetStaffLevelsFromLocalJobLevel = levelId => {
    return new Promise(async (resolve, reject) => {
        let levels = await StaffLevel.find({ levels: levelId });
        if (levels.length == 0) {
            return reject({
                code: 404,
                msg: `No staff level can access this job level`
            })
        }
        return resolve(levels);
    })
}