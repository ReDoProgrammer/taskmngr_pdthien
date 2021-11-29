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
        ref: 'job-level'
    },
    staff: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    qa: {
        type: Boolean,
        default: false
    },
    editor: {
        type: Boolean,
        default: false
    },
    status: {
        type: Number,
        default: -1
        /*
             -1: khởi tạo
             0: Editor đang xử lý
             1: editor done
             2: QA ok
             -2: qc reject
             3: DC ok => Job done
             -3: DC reject
        */
    },

    edited_time: {
        //thuộc tính đánh dấu số lần edit

        type: Number,
        default: 0
    },
    is_assigned: {
        //thuộc tính dùng để đánh dấu nhân viên được TLA giao việc (task) hay do nhân viên lựa chọn
        type: Boolean,
        default: false
    },
    remark:{
        //phần ghi chú cho task/level
        //cả tla, sale,admin,dc đều có thể can thiệp
        type:String,
        default:''
    }

},
    { timestamps: { assigned_date: 'assigned_date', deadline: 'deadline' } }
);




module.exports = mongoose.model('task', taskSchema);



