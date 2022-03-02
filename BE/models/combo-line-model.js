require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const comboLineSchema = new Schema({
    cb:{
        type:Schema.Types.ObjectId,
       ref:'combo'
    },
    lv:{
        type:Schema.Types.ObjectId,
        ref:'level'
    },
    qty:{
        type:Number,
        default:1
    }
    
});


module.exports = mongoose.model('combo_line',comboLineSchema);
