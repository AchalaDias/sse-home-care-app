import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    images: [
        {
            type: String, // Store the image URLs here
        },
    ],
    tags: [
        {
            type: String,
        },
    ],
    cost: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Job = mongoose.model('Job', JobSchema);
export default Job;
