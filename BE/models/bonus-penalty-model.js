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
    }
   
});

module.exports = mongoose.model('bonus-penalty',bonusPenaltySchema);