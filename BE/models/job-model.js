require('dotenv').config();
const moment = require('moment-timezone');
const dateThailand = moment.tz(Date.now(), "Asia/Bangkok");

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
    deadline: {
        begin: {
            type: Date,
            default: dateThailand,
            require: true
        },
        end: {
            type: Date,
            default: dateThailand,
            require: true
        }
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
                       
            - 2: Canceled           
        */
        type: Number,
        default: -1
    },

    link: {
        input: {
            //link này chứa hình ảnh source khi sale tạo mới job
            type: String,
            default: ''
        },
        output: {
            type: String,
            default: ''
        }
    },


    cb: {
        //lưu mã combo được chọn
        type: Schema.Types.ObjectId,
        ref: 'combo'
    },

    cc: [{
        remark: {
            type: String
        },
        root: {
            type: Schema.Types.ObjectId,
            ref: 'mapping',
            tasks: [{
                type: Schema.Types.ObjectId,
                ref: 'task'
            }]
        },
        fee: {
            type: Boolean,
            default: false
        },

        created: {
            at: {
                type: Date
            },
            by: {
                type: Schema.Types.ObjectId,
                ref: 'user'
            }
        },
        requested: {
            at: {
                type: Date,
            },
            by: {
                type: Schema.Types.ObjectId,
                ref: 'customer'
            }
        }
    }],

    created: {
        by: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        at: {
            type: Date,
            default: new Date()
        }
    },
    updated: [
        {
            by: {
                type: Schema.Types.ObjectId,
                ref: 'user'
            },
            at: {
                type: Date
            }
        }
    ],

    //phan lien quan toi nhan vien chup anh
    captured: {
        material: {
            type: Schema.Types.ObjectId,
            ref: 'material'
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        price: {
            type: Number,
            default: 0
        },
        quantity: {
            type: Number,
            default: 0
        }
    },

    //phần liên quan tới job template
    template: {
        type: Schema.Types.ObjectId,
        ref: 'template'
    },
    //thuộc tính đánh dấu mức độ ưu tiên của job
    urgent: {
        type: Boolean,
        default: false
    }
});


module.exports = mongoose.model('job', jobSchema);



