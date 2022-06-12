const router = require('express').Router();
const { authenticateTLAToken } = require("../../../middlewares/tla-middleware");
const User = require('../../models/user-model');
const Module = require('../../models/module-model');
const { ObjectId } = require('mongodb');

const _EDITOR = 'EDITOR';
const _QA = 'QA';



router.get('/list-editor', authenticateTLAToken, async (req, res) => {


    let { levelId } = req.query;

    let sjl = await StaffJobLevel.find({job_lv:levelId});
   
    if(sjl.length == 0){
        return res.status(404).json({
            msg:`No staff level found based on this job level!`
        })
    }
    
    let stlIds = sjl.map(x=>x.staff_lv);
    

    let m = await getModuleByName(_EDITOR);
    if(!m){
        return res.status(404).json({
            msg:`Module editor not found!`
        })
    }

    let ums = await UserModule.find({module:m._id});
    if(ums.length == 0){
        return res.status(404).json({
            msg:`No editor found can access editor module!`
        })
    }
    let userInModule = ums.map(x=>x.user);

    let wages = await Wage.find({
        module: m._id,
        job_lv: levelId,
        staff_lv: {$in:stlIds}

    });

    if(wages.length == 0){
        return res.status(404).json({
            msg:`Please set wage into editor to continue!`
        })
    }

    let ugs = wages.map(x=>x.user_group);
    
    let editors = await User.find({
        user_group: {$in:ugs},
        user_level: {$in:stlIds},
        _id: {$in:userInModule}
    }).select('fullname username');

    if(editors.length == 0){
        return res.status(404).json({
            msg:`No editors found!`
        })
    }

    return res.status(200).json({
        msg:`Load editors based on job level successfully!`,
        editors
    })


})

/*
    Hàm load danh sách Q.A dựa vào module đã set quyền nhân viên
    Chỉ load những nhân viên Q.A có trạng thái hoạt động is_active:true
   
*/

router.get('/list-qa', authenticateTLAToken, async (req, res) => {

    let { levelId } = req.query;

    let sjl = await StaffJobLevel.find({job_lv:levelId});
   
    if(sjl.length == 0){
        return res.status(404).json({
            msg:`No Q.A staff level found based on this job level!`
        })
    }
    
    let stlIds = sjl.map(x=>x.staff_lv);
    

    let m = await getModuleByName(_QA);
    if(!m){
        return res.status(404).json({
            msg:`Module QA not found!`
        })
    }

    let ums = await UserModule.find({module:m._id});
    if(ums.length == 0){
        return res.status(404).json({
            msg:`No Q.A found can access Q.A module!`
        })
    }
    let userInModule = ums.map(x=>x.user);

    let wages = await Wage.find({
        module: m._id,
        job_lv: levelId,
        staff_lv: {$in:stlIds}

    });

    if(wages.length == 0){
        return res.status(404).json({
            msg:`Please set wage into Q.A to continue!`
        })
    }

    let ugs = wages.map(x=>x.user_group);
    
    let qas = await User.find({
        user_group: {$in:ugs},
        user_level: {$in:stlIds},
        _id: {$in:userInModule}
    }).select('fullname username');

    if(qas.length == 0){
        return res.status(404).json({
            msg:`No Q.A found!`
        })
    }

    return res.status(200).json({
        msg:`Load Q.A based on job level successfully!`,
        qas
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


