require('dotenv').config();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const taskSchema = new Schema({
    job: {
        type: Schema.Types.ObjectId,
        ref: 'job'
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
    assigned_date: {
        type: String      
    },
    deadline: {
        type: String
    },
    status: {
        type: Number,
        default: -1
        /*
             -1: editor nhận
             0: Editor đang xử lý
             1: editor done
             2: QA ok
             -2: qc reject
             3: DC ok => Job done
             -3: DC reject
        */
    },
    edited_time: {
        type: Number,
        default: 0
    }

},
    { timestamps: { assigned_date: 'assigned_date', deadline: 'deadline' } }
);




module.exports = mongoose.model('task', taskSchema);



