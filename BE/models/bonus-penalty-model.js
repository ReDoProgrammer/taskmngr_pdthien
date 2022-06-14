require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*

    Model này dùng để quản lý nguyên nhân phạt
*/
const bonusPenaltySchema = new Schema({
    name:{
        type: String       
    },
    description:{
        type:String
    },
    is_bonus:{
        type:Boolean,
        default:false
    },
    lines:[
        {
            task:{
                type:Schema.Types.ObjectId,
                ref:'task'
            },
            user:{
                type:Schema.Types.ObjectId,
                ref:'user'
            },
            is_bonus:{
                type:Boolean,
                default:true
            },
            remark:{
                type:String
            },
            costs:{
                type:Number
            },
            
            decided:{
                by:{
                    type:Schema.Types.ObjectId,
                    ref:'user'
                },
                at:{
                    type:Date
                }
            }
        }
    ]
   
});

module.exports = mongoose.model('bonus-penalty',bonusPenaltySchema);