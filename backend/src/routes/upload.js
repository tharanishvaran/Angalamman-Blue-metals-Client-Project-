const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireRole } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'file-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase().replace('.', '');
  const mime = (file.mimetype || '').toLowerCase();
  const allowedExts = ['jpeg', 'jpg', 'png', 'webp', 'svg', 'gif', 'avif', 'bmp', 'jfif', 'tif', 'tiff', 'heic', 'heif'];

  if (allowedExts.includes(ext) || mime.startsWith('image/') || mime === 'application/octet-stream') {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP, SVG, GIF, AVIF) are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max limit for high-resolution images
  fileFilter
});

router.post('/', requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Image file is too large (maximum limit is 50MB)' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message || 'Image upload failed' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({
      message: 'Image uploaded successfully',
      imageUrl,
      filename: req.file.filename
    });
  });
});

module.exports = router;
