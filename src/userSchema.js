import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = mongoose.Schema({
    googleId: String,
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    ratings: {
        type: Number,
        required: true,
        default: 0
    },
    ratingCount: {
        type: Number,
        required: true,
        default: 0
    },
    covidPositiveDate: {
        type: Date,
        default: null
    },
    resetPasswordToken: String,
    resetPasswordExpires: Number
}, { versionKey: false });

// Define a pre-save hook to hash the password before saving it to the database
userSchema.pre('save', async function (next) {
    try {
        const user = this;
        if (!user.isModified('password')) {
            return next();
        }
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
        next();
    } catch (error) {
        return next(error);
    }
});

const User = mongoose.model('User', userSchema);
export default User;