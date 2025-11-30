const uploadService = require('../services/upload.service');

/**
 * Handle admin Excel upload for SPL challenge
 * POST /api/upload/admin/upload
 */
async function handleUpload(req, res) {
  try {
    console.log('\n📥 Received upload request');
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please attach an Excel file.'
      });
    }

    console.log(`📎 File received: ${req.file.originalname} (${req.file.size} bytes)`);

    // Process the upload
    const result = await uploadService.processUpload(req.file);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Upload processed successfully',
      challenge_day: result.challenge_day,
      total_users_processed: result.total_users_processed,
      upload_id: result.upload_id
    });

  } catch (error) {
    console.error('❌ Upload failed:', error);
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Upload processing failed'
    });
  }
}

/**
 * Upload single file (generic)
 */
async function uploadSingle(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        path: req.file.path
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Upload multiple files (generic)
 */
async function uploadMultiple(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    return res.status(200).json({
      success: true,
      message: `${req.files.length} files uploaded successfully`,
      files: req.files.map(f => ({
        filename: f.filename,
        originalname: f.originalname,
        size: f.size,
        path: f.path
      }))
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Get all uploaded files (placeholder)
 */
async function getAllFiles(req, res) {
  try {
    return res.status(200).json({
      success: true,
      message: 'File listing not implemented yet',
      files: []
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Get file by ID (placeholder)
 */
async function getFileById(req, res) {
  try {
    return res.status(200).json({
      success: true,
      message: 'File retrieval not implemented yet',
      file: null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Delete file by ID (placeholder)
 */
async function deleteFile(req, res) {
  try {
    return res.status(200).json({
      success: true,
      message: 'File deletion not implemented yet'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  handleUpload,
  uploadSingle,
  uploadMultiple,
  getAllFiles,
  getFileById,
  deleteFile
};
