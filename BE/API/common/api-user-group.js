require("dotenv").config();
const router = require("express").Router();
const UserGroup = require('../../models/user-group-model');

router.get('/',(req,res)=>{
    UserGroup.find({},function(err,groups){
        if(err){
            return res.status(500).json({
                msg: `Lỗi load danh sách nhóm tài khoản ${err.message}`,
              });
        }
        if(groups){
            res.status(200).json({
                msg:'Load danh sách nhóm tài khoản thành công!',
                groups:groups
            });
        }
    });
})

module.exports = router;