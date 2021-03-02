const router = require('express').Router();
const Status = require('../../models/status-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");

router.delete('/',authenticateAdminToken,(req,res)=>{
    let id = req.body.id;
    Status.findOneAndDelete({_id:id},(err,status)=>{
        if(err){
            return res.status(500).json({
                msg:'Xóa status thất bại!',
                error:new Error(err.message)
            });
        }

        if(status){
            return res.status(200).json({
                msg:'Xóa status thành công!'
            });
        }else{
            return res.status(404).json({
                msg:'Không tìm thấy status cần xóa trong hệ thống!'
            })
        }
        
    })
})

router.get('/',(req,res)=>{
    Status.find({},(err,statuses)=>{
        if(err){
            return res.status(500).json({
                msg:'load status list failed'
            });
        }

        return res.status(200).json({
            msg:'Load status list successfully!',
            statuses:statuses
        });
    });
});

router.get('/detail',authenticateAdminToken,(req,res)=>{
    let {id} = req.query;
    Status.findById(id,(err,status)=>{
        if(err){
            return res.status(500).json({
                msg:'Lấy thông tin status thất bại!',
                error:new Error(err.message)
            });
        }
        if(status){
            return res.status(200).json({
                msg:'Lấy thông tin status thành công!',
                status:status
            })
        }else{
            return res.status(404).json({
                msg:'Không tìm thấy status tương ứng!'
            });
        }
    })
})


router.post('/',authenticateAdminToken,(req,res)=>{
    let {name,description,status} = req.body;

    //ràng buộc dữ liệu cho tên trạng thái
    if(name.length == 0){
        return res.status(403).json({
            msg:'Vui lòng nhập tên của trạng thái!'
        });
    }
    let stt = new Status({
        name:name,
        description:description,
        status:status
    });
    stt.save()
    .then(status=>{
        return res.status(201).json({
            msg:'Thêm mới status thành công!',
            status:status
        });
    })
    .catch(err=>{
       return res.status(500).json({
           msg:'Thêm mới status thất bại!',
           error:new Error(err.message)
       });
    })
})

router.put('/',authenticateAdminToken,(req,res)=>{
    let {id,name,description,status} = req.body;    

    //ràng buộc dữ liệu cho tên trạng thái
    if(name.length == 0){
        return res.status(403).json({
            msg:'Vui lòng nhập tên của trạng thái!'
        });
    }

    Status.findOneAndUpdate({_id:id},{
        name,
        description,
        status
    },{new:true},(err,status)=>{
        if(err){
            return res.status(500).json({
                msg:'Cập nhật thông tin status thất bại!',
                error:new Error(err.message)
            });
        }

        if(status){
            return res.status(200).json({
                msg:'Cập nhật thông tin status thành công!',
                status:status
            });
        }else{
            return res.status(500).json({
                msg:'Cập nhật thông tin status thất bại!'                
            });
        }
    })
})

module.exports = router;