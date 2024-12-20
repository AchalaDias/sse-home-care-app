import User from "../userSchema.js";

export class UserModel {

    async add(username, email, password, isAdmin=false) {
        try {
            const user = new User({
                username: username,
                email: email,
                password: password,
                isAdmin: isAdmin
            })
            await user.save();
            return user;
        } catch (error) {
            console.log(error);
        }
    }
    async verify(email) {
        try {
            const user = User.findOne({ email: email });
            return user;
        } catch (error) {
            console.log(error);
        }
    }

    async getUser(id) {
        try {
            const user = await User.findById(id);
            return user;
        } catch (error) {
            console.log(error);
        }
    }

    async verifyOtp(id, otp) {
        try {
            const user = await User.findOne({ _id: id });
            if(user.otp === otp) 
                return user
            return null;
        } catch (error) {
            console.log(error);
        }
    }
}