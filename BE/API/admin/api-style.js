const router = require('express').Router();
const Style = require('../../models/style-model');
const { authenticateAdminToken } = require("../../../middlewares/middleware");

router.delete('/',authenticateAdminToken,(req,res)=>{
    let id = req.body.id;
    Style.findOneAndDelete({_id:id},(err,style)=>{
        if(err){
            return res.status(500).json({
                msg:'Xóa style thất bại!',
                error:new Error(err.message)
            });
        }

        if(style){
            return res.status(200).json({
                msg:'Xóa style thành công!'
            });
        }else{
            return res.status(404).json({
                msg:'Không tìm thấy style cần xóa trong hệ thống!'
            });
        }
        
    })
})

router.get('/',(req,res)=>{
    Style.find({},(err,styles)=>{
        if(err){
            return res.status(500).json({
                msg:'load styles list failed'
            });
        }

        return res.status(200).json({
            msg:'Load styles list successfully!',
            styles:styles
        });
    });
});

router.get('/detail',authenticateAdminToken,(req,res)=>{
    let {id} = req.query;

    Style.findById(id,(err,style)=>{
        if(err){
            return res.status(500).json({
                msg:'Lấy thông tin style thất bại!',
                error:new Error(err.message)
            });
        }
        if(style){
            return res.status(200).json({
                msg:'Lấy thông tin style thành công!',
                style:style
            })
        }else{
            return res.status(404).json({
                msg:'Không tìm thấy style tương ứng!'
            });
        }
    })
})


router.post('/',authenticateAdminToken,(req,res)=>{
    let {key,value} = req.body;

    //ràng buộc dữ liệu cho tên style
    if(key.length == 0){
        return res.status(403).json({
            msg:'Vui lòng nhập tên của style!'
        });
    }
    let style = new Style({
        key,
       value
    });
    style.save()
    .then(status=>{
        return res.status(201).json({
            msg:'Thêm mới style thành công!',
            status:status
        });
    })
    .catch(err=>{
       return res.status(500).json({
           msg:'Thêm mới style thất bại!',
           error:new Error(err.message)
       });
    })
})

router.put('/',authenticateAdminToken,(req,res)=>{
    let {id,key,value} = req.body;    

    //ràng buộc dữ liệu cho tên trạng thái
    if(key.length == 0){
        return res.status(403).json({
            msg:'Vui lòng nhập tên của style!'
        });
    }

    Style.findOneAndUpdate({_id:id},{
        key,
        value
    },{new:true},(err,style)=>{
        if(err){
            return res.status(500).json({
                msg:'Cập nhật thông tin style thất bại!',
                error:new Error(err.message)
            });
        }

        if(style){
            return res.status(200).json({
                msg:'Cập nhật thông tin style thành công!',
                style:style
            });
        }else{
            return res.status(500).json({
                msg:'Cập nhật thông tin style thất bại!'                
            });
        }
    })
})

module.exports = router;