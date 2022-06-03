require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/*  
    Model này dùng để lưu trữ các template đầu vào của job
    - Khi tạo job sale sẽ tick vào các template mong muốn
    -- TLA sẽ dựa vào đó để tạo các task ứng với job level phù hợp
*/

const templateSchema = new Schema({
    name:{
        type:String,
        required: [true, 'Please input template name']
    },
    description:{
        type:String,
        default:''
    }    
});


module.exports = mongoose.model('template',templateSchema);

