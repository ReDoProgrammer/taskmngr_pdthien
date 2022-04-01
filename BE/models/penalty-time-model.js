require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*

    Model này dùng để quản lý mức phạt của nhân viên
    Liên quan tới từng task cụ thể
*/
const penaltyTimeSchema = new Schema({
    task:{
        type: Schema.Types.ObjectId,
        ref:'task'
    },
    penalty:{// tham chiếu tới lí do phạt
        type: Schema.Types.ObjectId,
        ref:'penalty'  
    },
    employees:[
        {
            fines: {
                Type: Number,
                default: 0
            },
            user:{
                type: Schema.Types.ObjectId,
                ref:'user'
            }
        }
    ]
});

module.exports = mongoose.model('penalty_time',penaltyTimeSchema);