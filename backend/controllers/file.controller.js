const File = require('../models/file.model');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// Upload file to IPFS and save record to database
exports.uploadFile = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Check authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Extract file information
    const fileName = req.file.originalname;
    const filePath = req.file.path;

    // Verify Pinata credentials exist
    if (!process.env.PINATA_API_KEY || !process.env.PINATA_API_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'IPFS configuration error: Pinata API credentials not configured'
      });
    }

    // Create form data for Pinata
    const data = new FormData();
    data.append('file', fs.createReadStream(filePath), fileName);

    // Add metadata
    const metadata = JSON.stringify({
      name: fileName,
      keyvalues: {
        uploadedBy: req.user.id,
      }
    });
    data.append('pinataMetadata', metadata);

    // Upload to IPFS via Pinata
    try {
      const pinataRes = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
        maxBodyLength: 'Infinity',
        headers: {
          ...data.getHeaders(),
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_API_SECRET
        }
      });

      // Save file record to database
      const ipfsHash = pinataRes.data.IpfsHash;
      const fileRecord = new File({
        user: req.user.id,
        fileName,
        ipfsHash,
      });

      await fileRecord.save();

      // Return success response
      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        file: {
          fileName,
          ipfsHash,
          id: fileRecord._id
        },
        ipfsUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
      });
    } catch (pinataError) {
      console.error('Pinata API error:', pinataError.message);
      
      // Handle Pinata API errors
      if (pinataError.response) {
        console.error('Pinata status:', pinataError.response.status);
        console.error('Pinata response:', pinataError.response.data);
      }

      // Return error response
      return res.status(pinataError.response?.status || 500).json({
        success: false,
        message: `IPFS upload error: ${pinataError.message}`,
        details: pinataError.response?.data || {}
      });
    } finally {
      // Clean up the uploaded file from disk storage
      // Note: You might want to keep it depending on your requirements
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      details: err.message
    });
  }
};

exports.getAllFiles = async (req, res) => {
  try {
    // Check authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Fetch files from database
    const files = await File.find({ user: req.user.id }).sort({ createdAt: -1 });

    // Map files to include IPFS URLs
    const filesWithUrls = files.map(file => ({
      id: file._id,
      fileName: file.fileName,
      ipfsHash: file.ipfsHash,
      uploadedAt: file.createdAt,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`
    }));

    // Return response
    res.status(200).json({
      success: true,
      count: filesWithUrls.length,
      files: filesWithUrls
    });
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      details: err.message
    });
  }
};
