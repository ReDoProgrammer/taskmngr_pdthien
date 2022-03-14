const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const remarkSchema = new Schema({
    /*
        Model này dùng để quản lý nội dung của các chú ý
        cụ thể: task remark,
        reject note
    */
    user:{
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    timestamp:{
        type: Date,
        default: Date.now
    },
    content:{
        type:String
    },
    tid:{
        type: Schema.Types.ObjectId,
        ref:'task'
    }   
    
});

module.exports = mongoose.model('remark',remarkSchema);