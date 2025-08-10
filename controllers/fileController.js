const multer = require('multer');
const fs = require('fs');
const File = require('../models/File');
const fileQueue = require('../queues/fileQueue'); // Add this line

// Setup Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// File upload logic
const uploadFile = async (req, res) => {
    upload.single('file')(req, res, async function (err) {
        if (err) {
            return res.status(500).json({ message: 'Error uploading file', error: err.message });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            // Save file information to MongoDB
            const newFile = new File({
                filename: req.file.originalname,
                path: req.file.path,
                status: 'processing'
            });

            await newFile.save();

            // Add job to queue for file processing (compression)
            await fileQueue.add({
                filename: req.file.originalname,
                path: req.file.path
            });

            res.status(200).json({
                message: 'File uploaded and processing started',
                file: newFile
            });
        } catch (error) {
            res.status(500).json({ message: 'Error uploading file', error: error.message });
        }
    });
};

// File download logic for compressed file
const downloadCompressedFile = async (req, res) => {
    try {
        const fileId = req.params.fileId; // Use 'fileId' as per the route
        const file = await File.findById(fileId);

        if (!file || file.status !== 'processed') {
            return res.status(404).json({ message: 'File not found or still processing' });
        }

        const compressedFilePath = file.path + '.zip'; // Use '.zip' instead of '.gz'
        res.download(compressedFilePath);
    } catch (error) {
        res.status(500).json({ message: 'Error downloading file', error: error.message });
    }
};

module.exports = { uploadFile, downloadCompressedFile };
