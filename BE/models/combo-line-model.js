require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const comboLineSchema = new Schema({
    cb:{
        type:Schema.Types.ObjectId,
       ref:'combo'
    },
    parents:{
        type:Schema.Types.ObjectId,
        ref:'parents_level'
    },
    root:{
        type:Schema.Types.ObjectId,
        ref:'root_level'
    },
    qty:{
        type:Number,
        default:1
    }
    
});


module.exports = mongoose.model('combo_line',comboLineSchema);
