require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const wageSchema = new Schema({
    user_group:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'user_group'
    },
    module:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'module'
    },
    level:{
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
    user_group:1,
    module:1,
    level:1
},{
    unique:true
})


module.exports = mongoose.model('wage',wageSchema);



