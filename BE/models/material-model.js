const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/*
    Model này dùng để quản lý thông tin các loại ảnh mà sale chụp
    làm đầu vào cho job
*/

const materialSchema = new Schema({
    name:{
        type:String,
        required: [true, 'Please input sale material name']
    },
    description:{
        type:String,
        default:''
    },
    price:{
        type:Number,
        default:0
    }    
});


module.exports = mongoose.model('material',materialSchema);


