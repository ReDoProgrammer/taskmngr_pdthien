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
        //link này chứa hình ảnh output khi eidtor,qa,dc submit done TLA sẽ tổng hợp lại để post lên cho sale giao cho khách
        type:String,
        default:''
    }
});


module.exports = mongoose.model('job', jobSchema);



