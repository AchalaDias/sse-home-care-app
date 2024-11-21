import mongoose from 'mongoose';

const connectTodb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            dbName: process.env.MONGODB_NAME,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Mongodb connection established....');
    } catch (error) {
        console.log(error);
        throw new Error('Mongodb connection error: ' + error);
    }
}

export default connectTodb;