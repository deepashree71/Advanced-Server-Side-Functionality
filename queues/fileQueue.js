// queues/fileQueue.js
const Queue = require('bull');
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const File = require('../models/File');

const fileQueue = new Queue('file processing', {
    redis: {
        host: 'redis',
        port: 6379,
    },
});
const archiver = require('archiver');

fileQueue.process(async (job) => {
    const { filename, path: filePath } = job.data;
    const originalFilePath = path.join(__dirname, '../', filePath);
    const compressedFilePath = `${originalFilePath}.zip`;

    try {
        const output = fs.createWriteStream(compressedFilePath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Compression level
        });

        output.on('close', () => {
            console.log(`File compressed successfully: ${archive.pointer()} total bytes`);
        });

        archive.on('error', (err) => {
            throw err;
        });

        archive.pipe(output);
        archive.file(originalFilePath, { name: filename });
        await archive.finalize();

        // Update file status in MongoDB
        await File.findOneAndUpdate(
            { filename },
            { status: 'processed', path: compressedFilePath }
        );

        return { status: 'processed', compressedFilePath };
    } catch (error) {
        console.error('Error processing file:', error);
        throw new Error('File compression failed');
    }
});

module.exports = fileQueue;
