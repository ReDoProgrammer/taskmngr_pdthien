require('dotenv').config();

const mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose);
const Schema = mongoose.Schema;


const customerLevelModel = new Schema({
    customer:{
        type:Schema.Types.ObjectId,
       ref:'customer'
    },
    level:{
        type:Schema.Types.ObjectId,
        ref:'level'        
    },
    price:{
        type:Float,
        default:0
    }
    
});

customerLevelModel.index({ customer: 1, level: 1 }, { unique: true });


module.exports = mongoose.model('customer_level',customerLevelModel);



