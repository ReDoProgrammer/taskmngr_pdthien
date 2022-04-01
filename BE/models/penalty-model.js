require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*

    Model này dùng để quản lý nguyên nhân phạt
*/
const penaltySchema = new Schema({
    name:{
        type: String       
    },
    description:{
        type:String
    }
   
});

module.exports = mongoose.model('penalty',penaltySchema);