const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

//This is the base model of a user to identify their porpouse in the app.
let userSchema = new Schema({
    ID: {
        type: String,
        required: [true, 'The user ID must be provided'],
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['ADMIN', 'PROVIDER', 'USER'],
        default: 'USER',
        required: true
    },
    active: {
        type: Boolean,
        default: true,
        required: true
        
    },
    record: {
        createdDate: {
            type: Date,
            default: Date.now,
            required: true
        },
        lastModified: {
            by: {
                type: String,
                default: 'System',
                required: true
            },
            timeStamp: {
                type: Date,
                default: Date.now,
                required: true
            }
        },
        createdBy: {
            type: String,
            default: 'System',
            required: true
        },
    }
});

userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();

    const salt = await bcrypt.genSalt(Number(process.env.saltRounds));
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    next();
});

userSchema.methods.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});

module.exports = mongoose.model('user', userSchema);