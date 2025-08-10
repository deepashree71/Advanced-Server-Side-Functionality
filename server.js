const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const loggingMiddleware = require('./middlewares/loggingMiddleware');
const { uploadFile, downloadCompressedFile } = require('./controllers/fileController');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(loggingMiddleware);
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Routes
app.post('/upload', uploadFile);
app.get('/download/:fileId', downloadCompressedFile); // Route corrected

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
