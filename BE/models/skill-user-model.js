require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const skillUserSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'user'
    },
    skill:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'skill'
    } 
});

statusSchema.index({
    user:1,
    skill:1
},{
    unique:true
})


module.exports = mongoose.model('skill_users',skillUserSchema);



