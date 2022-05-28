require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ccSchema = new Schema({
    job:{
        //job mà CC tham chiếu tới
        type:Schema.Types.ObjectId,
        ref:'job'
    },
    status:{
        /*
            Trạng thái CC:
            -1: được tạo từ sale/customer
            0: TLA đã phân rã công việc
            1: EDITOR đã submit
            2: QA đã submit
            3: DC đã submit
            4: SALE đã submit
        */
        type:Number,
        default:-1
        
    },
    type:{
        /*
            Đánh dấu trạng thái của loại CC
            false: không tính tiền, chỉnh sửa task cũ do chưa đạt yêu cầu
            true: tính tiền, tạo task mới
        */
        type:Boolean,
        default:false
    },
    remark:{
        //ghi chú của CC
        type:String,
        default:''
    },
    created:{
        by:{
            type: Schema.Types.ObjectId,
            ref:'user'
        },
        at:{
            type: Date,
            default: new Date()
        }
    },
    updated:{
        by:{
            type:Schema.Types.ObjectId,
            ref:'user'
        },
        at:{
            type:Date
        }
    },
    task: [
        //danh sách tham chiếu tới task được tạo để giải quyết CC
        //danh sách này có thể rỗng vì cc chỉ yêu cầu sửa lại task cũ
        {
            type:Schema.Types.ObjectId,
            ref:'task'
        }
    ],   
   fix_task:{
       //lưu task id trong trường hợp cần fix 1 task nào đó - trường hợp CC refix
       type:Schema.Types.ObjectId,
       ref:'task'
   }
    
});


module.exports = mongoose.model('cc',ccSchema);

