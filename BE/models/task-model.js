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
    price: {
        //lưu thông tin đơn giá của level để tính cho khách hàng
        type: Number,
        default: 0
    },
    deadline: {
        begin: {
            type: Date,
            default: new Date()
        },
        end: {
            //ngày task cần hoàn thành
            type: Date

        }
    },


    dc: [{
        staff: {
            //DC nào nhận và submit/reject task
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        got_at: {
            //thời gian DC nhận task
            type: Date
        },
        submited_at: {
            //Thời gian DC submit task
            type: Date
        },
        wage: {
            //Tiền công của DC
            type: Number
        }
    }],
    qa: [{
        staff: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        wage: {
            type: Number,
            default: 0
        },
        is_assigned: {
            type: Boolean,
            default: false
        },
        assigned_by: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        assigned_at: {
            type: Date,
            default: new Date()
        },
        submited_at: {
            type: Date
        }
    }],

    editor: [{
        staff: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        wage: {
            type: Number,
            default: 0
        },
        is_assigned: {
            type: Boolean,
            default: false
        },
        assigner: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        assigned_date: {
            type: Date,
            default: new Date()
        },
        done: [
            {
                type: Date
            }
        ],
        times: {
            //thuộc tính đánh dấu số lần edit

            type: Number,
            default: 0
        }
    }],

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
              -4: Sale reject
              -5: Cancel
            */

    },

    link: {
        input: {
            type: String,
            require: true
        },
        output: {
            //link thành phẩm sau khi editor đã hoàn thành task của mình và submit done
            type: String,
            require: true
        },
        upload: {
            type: String,
            default: ''
        }
    },

    amount: {
        //số lượng file xuất ra của editor
        type: Number,
        default: 0
    },

    created: {
        at: {
            type: Date,
            default: new Date()
        },
        by: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    },
    updated: {
        at: {
            type: Date,
            default: new Date()
        },
        by: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    },
    submited: {
        at: {
            type: Date,
            default: new Date()
        },
        by: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    },

    finished: {
        at: {
            type: Date,
            default: new Date()
        },
        by: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    },
    uploaded: {
        at: {
            type: Date,
            default: new Date()
        },
        by: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    },
    rejected: {
        at: {
            type: Date,
            default: new Date()
        },
        by: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    },

    canceled: {
        reason: {
            /*
           field này dùng để đánh dấu nguyên nhân task bị cancel
           -1: TLA gán sai
           -2: Sale thiết lập sai
           -3: Khách hàng hủy
           -4: Lý do khác
    
       */
            type: Number
        },
        at: {
            type: Date,
            default: new Date()
        },
        by: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    },

    bp: [{
        // lưu lý do thưởng/phạt
        //vì cùng 1 task có thể vừa thưởng, vừa phạt nên cần lưu trữ dạng mảng
        type: Schema.Types.ObjectId,
        ref: 'bonus-penalty'
    }],
    remarks: [{
        //phần ghi chú cho task/level
        //cả tla, sale,admin,dc đều có thể can thiệp
        type: Schema.Types.ObjectId,
        ref: 'remark'
    }]

});




module.exports = mongoose.model('task', taskSchema);





