require('dotenv').config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const customerSchema = new Schema({
    firstname:{
        type:String      
    },    
    lastname:{
        type:String       
    },    
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:String
    },
    address:{
        type:String
    },
    output:{
        type:Schema.Types.ObjectId,
        ref:'file_format'
    },
    size:{
        type:Schema.Types.ObjectId,
        ref:'size'
    },
    color_mode:{
        type:Schema.Types.ObjectId,
        ref:'color_mode'
    },
    is_align:{
        type:Boolean,
        default:false
    },
    align_note:{
        type:String,
        default:''
    },
    cloud:{
        type:Schema.Types.ObjectId,
        ref:'cloud'
    },
    national_style:{
        type:Schema.Types.ObjectId,
        ref:'national_style'
    },
    remark:{
        type:String,
        default:''
    },
    has_TV:{
        type:Boolean,
        default:false
    },
    TV_note:{
        type:String,
        default:''
    },
    has_grass:{
        type:Boolean,
        default:false
    },
    grass_note:{
        type:String,
        default:''
    },
    has_sky:{
        type:Boolean,
        default:false
    },
    sky_note:{
        type:String,
        default:''
    },
    has_fire:{
        type:Boolean,
        default:false
    },
    fire_note:{
        type:String,
        default:''
    },
    levels:{
        type:Array
    }
    
});


module.exports = mongoose.model('customer',customerSchema);
