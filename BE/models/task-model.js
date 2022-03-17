require('dotenv').config();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const taskSchema = new Schema({
    job: {
        type: Schema.Types.ObjectId,
        ref: 'job'
    },
    level: {
        type: Schema.Types.ObjectId,
        ref: 'job_level'
    },
    level_price:{
        //lưu thông tin đơn giá của level để tính cho khách hàng
        type:Number,
        default:0
    },

    qa: {
        //lưu id của nhân viên Q.A
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    qa_wage:{
        //lưu tiền công của Q.A
        type:Number,
        default:0
    },
    qa_assigned:{
        //true: task này đc TLA assign trực tiếp cho 1 nhân viên làm Q.A 
        //
        type:Boolean,
        default:false
    },
    qa_assigner:{
        //đánh dấu TLA nào gán Q.A cho task
        type: Schema.Types.ObjectId,
        ref:'user'
    },
    qa_assigned_date: {
        /*
           Thuộc tính để đánh dấu 3 thao tác:
           1: thời điểm Q.A được TLA assign
           2: Thời điểm Q.A nhận task
           3: Thời điểm Q.A hủy nhận task
       */
       type: Date,
       default: new Date()
   },
   

   qa_done:{
       //ngày giờ Q.A submit task
       type:Date
   },



    editor: {
        //lưu id nhân viên làm Editor
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    editor_wage:{
        //lưu tiền công của editor
        type:Number,
        default:0
    },
    editor_assigned:{
        //khi true <=> task này đc TLA assign trực tiếp cho 1 nhân viên làm Editor
        //false: nhân viên Editor tự nhận task
        type:Boolean,
        default:false
    },
    editor_assigner:{
        //đánh dấu TLA nào gán editor cho task
        type: Schema.Types.ObjectId,
        ref:'user'
    },
    editor_assigned_date: {
        //ngày editor đc TLA gán cho task
        type: Date,
        default: new Date()
    },
    editor_done:{
        //ngày editor submit done task
        type:Date
    },

    edited_time: {
        //thuộc tính đánh dấu số lần edit

        type: Number,
        default: 0
    },
   
    remarks: [{
        //phần ghi chú cho task/level
        //cả tla, sale,admin,dc đều có thể can thiệp
        type: Schema.Types.ObjectId,
        ref:'remark'
    }],
    
  
    assigned_date:{   
        //ngày tạo task
        type: Date,
        default: new Date()
    },
    deadline: {
        //ngày task cần hoàn thành
        type: Date,
        require: true
    },

  
   

    dc:{
        //DC nào nhận và submit/reject task
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    dc_get:{
        //thời gian DC nhận task
        type:Date
    },
    dc_done:{
        //Thời gian DC submit task
        type:Date
    },
    dc_wage:{
        //Tiền công của DC
        type:Number
    },


    status: {
        type: Number,
        default: -1
       /*
            
             0: Editor đang xử lý
             1: editor done
             2: QA ok
             3: DC ok --> job ok
             4: Upload
             5: Done
             6: Finish

             
             -1: khởi tạo
             -2: Q.A reject            
             -3: DC reject
             -4: cancel
           */

    },


    input_link:{
        //link hình ảnh của task khi TLA giao việc cho editor,qa
        type:String,
        require:true
    },
    output_link:{
        //link thành phẩm sau khi editor đã hoàn thành task của mình và submit done
        type:String,
        require:true
    },
    uploaded_link:{
        type:String,
        default:''
    },
    amount:{
        //số lượng file xuất ra của editor
        type: Number,
        default:0
    },
    canceled_reason:{
        /*
            field này dùng để đánh dấu nguyên nhân task bị cancel
            -1: TLA gán sai
            -2: Sale thiết lập sai
            -3: Khách hàng hủy
            -4: Lý do khác

        */
        type:Number
    },
   
    created_by:{
        type: Schema.Types.ObjectId,
        ref:'user'
    },
    created_at:{
        type: Date,
        default: new Date()
    },
    updated_by:{
        type: Schema.Types.ObjectId,
        ref:'user'
    },
    updated_at:{
        type: Date,
        default: new Date()
    },
    canceled_by:{
        type: Schema.Types.ObjectId,
        ref:'user'
    },
    canceled_at:{
        type:Date,
        default: new Date()
    }

});




module.exports = mongoose.model('task', taskSchema);





