const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const upload = require('../middleware/upload.middleware');
const { uploadExcel } = require('../middleware/upload.middleware');

// Test route to verify routing is working
router.get('/test', (req, res) => {
  res.json({ success: true, route: 'upload working' });
});

// Routes
router.post('/single', upload.single('file'), uploadController.uploadSingle);
router.post('/multiple', upload.array('files', 10), uploadController.uploadMultiple);
router.post('/admin/upload', uploadExcel.single('file'), uploadController.handleUpload);
router.get('/files', uploadController.getAllFiles);
router.get('/files/:id', uploadController.getFileById);
router.delete('/files/:id', uploadController.deleteFile);

module.exports = router;

