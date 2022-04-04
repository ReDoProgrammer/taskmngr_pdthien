require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*

    Model này dùng để quản lý mức phạt của nhân viên
    Liên quan tới từng task cụ thể
*/
const bonusPenaltyLineSchema = new Schema({
    task:{
        type: Schema.Types.ObjectId,
        ref:'task'
    },
    bpId:{// tham chiếu tới lí do thưởng/phạt
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

module.exports = mongoose.model('bonus-penalty_time',bonusPenaltyLineSchema);