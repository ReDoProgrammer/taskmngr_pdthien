require('dotenv').config();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const taskSchema = new Schema({
    basic: {
        job: {
            // tham chiếu tới job
            type: Schema.Types.ObjectId,
            ref: 'job'
        },
        level: {
            //tham chiếu tới local level
            type: Schema.Types.ObjectId,
            ref: 'job_level'
        },
        mapping: {
            //tham chiếu tới customer job level
            type: Schema.Types.ObjectId,
            ref: 'mapping'
        },
        deadline: {
            begin: {
                type: Date,
                default: new Date()
            },
            end: {
                //ngày task cần hoàn thành
                type: Date

            }
        },
        link: {
            input: {
                type: String,
                default: ''
            },
            output: {
                type: String,
                default: ''
            }
        }
    },


    dc: [{
        staff: {
            //DC nào nhận và submit/reject task
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        got_at: {
            //thời gian DC nhận task
            type: Date
        },
        submited_at: {
            //Thời gian DC submit task
            type: Date
        },
        wage: {
            //Tiền công của DC
            type: Number
        },
        bp: {
            ref: {
                type: Schema.Types.ObjectId,
                ref: 'bonus_penalty'
            },
            is_bonus: {
                type: Boolean
            },
            costs: {
                type: Number,
                default: 0
            }
        },
        unregisted: {
            //lưu trạng thái task có bị DC hủy đăng ký hay không
            type: Boolean,
            default: false
        },
        rejected: [
            {
                at: {
                    type: Date,
                    default: new Date()
                },
                by: {
                    type: Schema.Types.ObjectId,
                    ref: 'user'
                }

            }
        ]
    }],
    qa: [{
        staff: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        wage: {
            type: Number,
            default: 0
        },
        bp: {
            ref: {
                type: Schema.Types.ObjectId,
                ref: 'bonus_penalty'
            },
            is_bonus: {
                type: Boolean
            },
            costs: {
                type: Number,
                default: 0
            }
        },
        tla: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        timestamp: {
            //thời điểm nhận or được gán
            type: Date
        },
        submited_at: [{
            type: Date
        }],

        rejected: [
            {
                at: {
                    type: Date
                },
                by: {
                    type: Schema.Types.ObjectId,
                    ref: 'user'
                }
            }
        ],
        visible: {
            type: Boolean,
            default: true
        }
    }],

    editor: [{
        staff: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        timestamp: {
            //thời điểm nhận or được gán
            type: Date,
            default: new Date()
        },
        wage: {
            type: Number,
            default: 0
        },
        tla: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        bp: {
            ref: {
                type: Schema.Types.ObjectId,
                ref: 'bonus_penalty'
            },
            is_bonus: {
                type: Boolean
            },
            costs: {
                type: Number,
                default: 0
            }
        },
        submited: [{
            at: {
                type: Date
            },
            amount: {
                //số lượng file xuất ra của editor
                type: Number,
                default: 0
            },
            link: {
                //link thành phẩm sau khi editor đã hoàn thành task của mình và submit done
                type: String,
                default: ''
            }
        }],
        visible: {
            type: Boolean,
            default: true
        }

    }],

    status: {
        type: Number,
        default: -1
        /*
             
              0: Editor đang xử lý
              1: editor done
              2: QA ok
              3: DC ok --> job ok
              4: Upload
              5: Done
              6: Finish
     
              -10: pause - tạm thời chưa cho các module khác xử lý
              -1: khởi tạo

              -2: Q.A reject            
              -3: DC reject
              -4: Sale reject
              -5: Cancel
              -6: TLA CC reject
            */

    },

    tla: {
        created: {
            at: {
                type: Date,
                default: new Date()
            },
            by: {
                type: Schema.Types.ObjectId,
                ref: 'user'
            }
        },
        updated: [{
            at: {
                type: Date
            },
            by: {
                type: Schema.Types.ObjectId,
                ref: 'user'
            }
        }],
        uploaded: [{
            at: {
                type: Date
            },
            by: {
                type: Schema.Types.ObjectId,
                ref: 'user'
            },
            link: {
                type: String,
                default: ''
            }

        }]

    },


    //thông tin liên quan tới kế toán
    finished: {
        at: {
            type: Date
        },
        by: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        paid: {
            type: Boolean,
            default: false
        }
    },

    canceled: {
        reason: {
            type: Schema.Types.ObjectId,
            ref: 'reason'
        },
        penalty: {
            type: Boolean,
            default:false
        },
        fines: {
            type: Number,
            default:0
        },
        at: {
            type: Date
        },
        by: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    },

    remarks: [{
        content: {
            type: String
        },
        created: {
            by: {
                type: Schema.Types.ObjectId,
                ref: 'user'
            },
            at: {
                type: Date
            }
        }
    }],

    fixible_task: {
        //thuộc tính tham chiếu tới cột fixible_tasks trong cc model
        type: Schema.Types.ObjectId,
        ref: 'cc'
    },
    additional_task: {
        //thuộc tính tham chiếu tới cột additional_tasks trong cc model
        type: Schema.Types.ObjectId,
        ref: 'cc'
    },

    //thong tinh danh dau thuong/phat tu Sale or TLA
    bp: [{
        bpId: {
            type: Schema.Types.ObjectId,
            ref: 'bonus_penalty'
        },
        costs: {
            type: Number
        },
        remark: {
            type: String,
            default: ''
        },
        created: {
            at: {
                type: Date,
                default: new Date()
            },
            by: {
                type: Schema.Types.ObjectId,
                ref: 'user'
            }
        },
        details: [{
            added: {
                at: {
                    type: Date
                },
                by: {
                    type: Schema.Types.ObjectId,
                    ref: 'user'
                }
            },
            staffs: [{
                type: Schema.Types.ObjectId,
                ref: 'user'
            }]
        }]
    }]
});




module.exports = mongoose.model('task', taskSchema);





