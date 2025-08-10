const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'processing' // or 'processed' when done
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
