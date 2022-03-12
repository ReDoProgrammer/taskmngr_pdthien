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
    status: {
        type: Number,
        default: -1
       /*
            
             0: Editor đang xử lý
             1: editor done
             2: QA ok
             3: DC ok --> job ok
             -1: khởi tạo
             -2: Q.A reject            
             -3: DC reject
             -4: cancel
           */

    },

    edited_time: {
        //thuộc tính đánh dấu số lần edit

        type: Number,
        default: 0
    },
   
    remark: {
        //phần ghi chú cho task/level
        //cả tla, sale,admin,dc đều có thể can thiệp
        type: String,
        default: ''
    },
    editor_assigner:{
        type: Schema.Types.ObjectId,
        ref:'user'
    },
    qa_assigner:{
        type: Schema.Types.ObjectId,
        ref:'user'
    },
    assigned_date:{
        type: Date,
        default: new Date()
    },
    deadline: {
        type: Date,
        require: true
    },

    editor_assigned_date: {
        type: Date,
        default: new Date()
    },
    qa_assigned_date: {
        type: Date,
        default: new Date()
    },
    editor_done:{
        type:Date
    },
    qa_done:{
        type:Date
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





