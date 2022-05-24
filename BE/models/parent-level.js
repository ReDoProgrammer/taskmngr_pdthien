require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
    Model này lưu trữ các level của khách hàng
    mỗi level này có thể có nhiều job_level ở phía quản lý cục bộ
*/
const parentLevelSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    levels: [{
        type: Schema.Types.ObjectId,
        ref: 'job_level'
    }]

});


module.exports = mongoose.model('parents-level', parentLevelSchema);

