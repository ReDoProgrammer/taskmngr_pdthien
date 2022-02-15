require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const wageSchema = new Schema({
    module:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'module'
    },
    user_group:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'user_group'
    },
    job_lv:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'job_level'
    },
    staff_lv:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'staff_level'
    },
    
    wage:{
        type:Number,
        default:0
    } 
});

wageSchema.index({    
    module:1,
    user_group:1,
    staff_lv:1,
    job_lv:1
},{
    unique:true
})


module.exports = mongoose.model('wage',wageSchema);



