require('dotenv').config();
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SALT_WORK_FACTOR = 10;


const customerSchema = new Schema({
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
    updated: {
        by: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        at: {
            type: Date
        }
    },

    group: {
        type: Schema.Types.ObjectId,
        ref: 'customer_group',
        require
    },
    name: {
        firstname: {
            type: String
        },
        lastname: {
            type: String
        }
    },
    contact: {
        email: {
            type: String,
            required: true,
            unique: true
        },
        phone: {
            type: String
        },
        address: {
            type: String
        }
    },
    password: {

    },

    style: {
        style_note: {
            type: String,
            default: ''
        },
        output: {
            type: Schema.Types.ObjectId,
            ref: 'file_format'
        },
        size: {
            type: Schema.Types.ObjectId,
            ref: 'size'
        },
        color: {
            type: Schema.Types.ObjectId,
            ref: 'color_mode'
        },
        cloud: {
            type: Schema.Types.ObjectId,
            ref: 'cloud'
        },
        nation: {
            type: Schema.Types.ObjectId,
            ref: 'national_style'
        },
        align: {
            checked: {
                type: Boolean,
                default: false
            },
            note: {
                type: String,
                default: ''
            },
        },

        tv: {
            checked: {
                type: Boolean,
                default: false
            },
            note: {
                type: String,
                default: ''
            }
        },
        grass: {
            checked: {
                type: Boolean,
                default: false
            },
            note: {
                type: String,
                default: ''
            }
        },
        sky: {
            checked: {
                type: Boolean,
                default: false
            },
            note: {
                type: String,
                default: ''
            }
        },
        fire: {
            checked: {
                type: Boolean,
                default: false
            },
            note: {
                type: String,
                default: ''
            }
        }
    },
    status: {//trạng thái hoạt động của khách hàng
        type: Boolean,
        default: true
    },

    jobs: [
        {
            type: Schema.Types.ObjectId,
            ref: 'job'
        }
    ],
    contracts: [
        {
            root: {
                type: Schema.Types.ObjectId,
                ref: 'root_level'
            },
            parents: {
                type: Schema.Types.ObjectId,
                ref: 'parents_level'
            },
            price: {
                type: Number,
                required: [
                    true,
                    `Please input price as number`
                ],
                min: [
                    0.001,
                    `Price is invalid!`
                ]
            },
            is_active:{
                type:Boolean,
                default:true
            }
        }
    ],
    group: {
        type: Schema.Types.ObjectId,
        ref: 'customer_group'
    }

});

customerSchema.pre("save", function (next) {
    var customer = this;


    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(customer.password, salt, function (err, hash) {
            if (err) return next(err);

            // only hash the password if it has been modified (or is new)
            if (customer.isModified("password")) {
                customer.password = hash;
                return next();
            }

            // override the cleartext password with the hashed one
            customer.password = hash;
            next();
        });
    });
});

customerSchema.methods.ComparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};


module.exports = mongoose.model('customer', customerSchema);
