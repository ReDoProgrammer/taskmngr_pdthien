require('dotenv').config();

const mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose);
const Schema = mongoose.Schema;
/*
Model này dùng để lưu trữ thông tin hợp đồng của khách hàng
quan hệ 1 - n tới khách hàng
cụ thể: bảng giá của từng level mặt hàng

*/

const customerLevelModel = new Schema({
    customer:{
        type:Schema.Types.ObjectId,
       ref:'customer'
    },
    level:{
        type:Schema.Types.ObjectId,
        ref:'job-level'        
    },
    price:{
        type:Float,
        default:0
    }
    
});

customerLevelModel.index({ customer: 1, level: 1 }, { unique: true });


module.exports = mongoose.model('customer_level',customerLevelModel);



