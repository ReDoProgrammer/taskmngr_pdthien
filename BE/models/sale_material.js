const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const saleMaterialSchema = new Schema({
    name:{
        type:String,
        required: [true, 'Please input sale material name']
    },
    description:{
        type:String,
        default:''
    },
    price:{
        type:Number,
        default:0
    }    
});


module.exports = mongoose.model('sale_material',saleMaterialSchema);


