import mongoose from 'mongoose';

const schema = new mongoose.Schema({

    deviceAddress: {
        type: String,
        required: true
    },

    temperature: {
        type: Number,
        required: true
    },
    humidity: {
        type: Number,
        required: true
    },

})

export default mongoose.model('sensorData', schema)