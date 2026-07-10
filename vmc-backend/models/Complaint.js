const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    category: {
        type: String,
        enum: ['garbage', 'pothole', 'light', 'other'],
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        text: { type: String, default: '' },
        lat:  { type: Number, default: null },
        lng:  { type: Number, default: null },
    },
    photoPath: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'resolved'],
        default: 'pending',
    },
    assignedTo: {
        type: String,
        default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
