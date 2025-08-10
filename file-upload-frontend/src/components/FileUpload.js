import React, { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Spinner from 'react-bootstrap/Spinner'; // Import Spinner

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({ 
    onDrop, 
    accept: {
      'application/zip': ['.zip'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
  });

  const uploadFile = async () => {
    if (!file) {
      toast.error("No file selected!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setProcessing(true);
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: 'blob',
      });

      const fileUrl = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(fileUrl);
      toast.success("File uploaded and compressed successfully!");

      // Reset the form
      setFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("File upload failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
      <div {...getRootProps({ className: "dropzone border p-4 text-center" })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop a file here, or click to select one</p>
      </div>

      {file && (
        <div className="mt-3">
          <p>Selected file: {file.name}</p>
        </div>
      )}

      <button
        className="btn btn-primary mt-3"
        onClick={uploadFile}
        disabled={processing}
      >
        {processing ? (
          <>
            <Spinner animation="border" size="sm" /> Processing...
          </>
        ) : (
          "Upload & Compress File"
        )}
      </button>

      {downloadUrl && (
        <div className="mt-4">
          <a href={downloadUrl} download="compressed-file.zip" className="btn btn-success">
            Download Compressed File
          </a>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
