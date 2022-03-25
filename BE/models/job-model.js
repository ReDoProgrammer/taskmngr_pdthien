require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const jobSchema = new Schema({
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'customer'
    },
    name: {
        type: String,
        default: ''
    },
    source_link: {
        type: String,
        require: [true, 'Source link can not be blank']
    },
    received_date: {
        type: Date,
        require: true
    },
    delivery_date: {
        type: Date,
        require: true
    },
    intruction: {
        type: String,
        default: ''
    },
    status: {
        /*            
            0: Processing
            1:Upload   
            2:Done
            3: finish

            -1: initial
            -2:'Rejected
            
            - 3: Canceled           
        */
        type: Number,
        default: -1
    },

    input_link:{
        //link này chứa hình ảnh source khi sale tạo mới job
        type:String,
        default:''
    },    
    output_link:{
        type:String,
        default:''
    },
    cb_ticked:{
        //đánh dấu có lựa chọn combo hay không
        type:Boolean,
        default:false
    },
    cb:{
        //lưu mã combo được chọn
        type:Schema.Types.ObjectId,
        ref:'combo'
    },
    tasks:[{
        type: Schema.Types.ObjectId,
        ref:'task'
    }]
   
});


module.exports = mongoose.model('job', jobSchema);



