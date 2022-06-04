const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rootLevelSchema = new Schema({
    /*
      Model này dùng để quản lý các job level ở phía khách hàng
      ví dụ: HDR. Là level cao nhất để set hợp đồng với khách hàng
      dùng để mapping tới các joblevel ở phía khách hàng: DTE, BASIC..      
    */

      name:{
          type:String,
          required: true
      },
      description:{
          type:String,
          default:''
      },
      parents:[
          {
            type:Schema.Types.ObjectId,
            ref:'parents-level'
          }
      ],
      job_levels:[
        {
          type:Schema.Types.ObjectId,
          ref:'job-level'
        }
    ],
    
});

module.exports = mongoose.model('root-level',rootLevelSchema);