require('dotenv').config();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//phân nhóm nhân viên: người nhà, người quen,...
const UserGroupSchema = new Schema({
    name: {
        type: String
    },
    description: {
        type: String,
        default: ''
    },
    registedable: {
        //thuộc tính đánh dấu khả năng có thể nhận thêm task của editor
        type: Boolean,
        default: false
    },
    wages: [{
        type: Schema.Types.ObjectId,
        ref: 'wage'
    }]
});


module.exports = mongoose.model('user_group', UserGroupSchema);