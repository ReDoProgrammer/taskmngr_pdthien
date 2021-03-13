require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const wageSchema = new Schema({
    user_type:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'user_type'
    },
    skill:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'skill'
    },
    level:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'local_level'
    },
    wage:{
        type:Number,
        default:0
    } 
});

wageSchema.index({
    user_type:1,
    skill:1,
    level:1
},{
    unique:true
})


module.exports = mongoose.model('wage',wageSchema);



