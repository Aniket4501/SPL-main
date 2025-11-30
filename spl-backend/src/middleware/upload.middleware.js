const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow all file types (customize as needed)
  // Example: only images
  // const allowedTypes = /jpeg|jpg|png|gif/;
  // const mimetype = allowedTypes.test(file.mimetype);
  // const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  // if (mimetype && extname) {
  //   return cb(null, true);
  // }
  // cb(new Error('Only image files are allowed'));
  
  cb(null, true);
};

// File filter for Excel files only
const excelFileFilter = (req, file, cb) => {
  const allowedExtensions = /xlsx/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  
  if (extname) {
    return cb(null, true);
  }
  cb(new Error('Only .xlsx files are allowed'));
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: fileFilter
});

// Configure multer for Excel uploads
const uploadExcel = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default for Excel
  },
  fileFilter: excelFileFilter
});

module.exports = upload;
module.exports.uploadExcel = uploadExcel;

