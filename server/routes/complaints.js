const express = require('express');
const router = express.Router();
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');
const {
  createComplaint,
  getMyComplaints,
  getMyComplaintStats,
  getComplaintById,
} = require('../controllers/complaintController');

// Multer setup for optional image upload
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDirectory = path.join(__dirname, '..', 'uploads');
    fs.mkdir(uploadDirectory, { recursive: true }, (err) => cb(err, uploadDirectory));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Only JPEG, PNG, and WebP images are allowed');
    error.status = 400;
    cb(error, false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// All routes require authentication
router.use(protect);

router.post('/', authorize('student'), upload.single('image'), (req, res, next) => {
  if (!req.body.location && req.body['location[building]'] !== undefined) {
    req.body.location = {
      building: req.body['location[building]'],
      room: req.body['location[room]'],
    };
  }
  next();
}, createComplaint);
router.get('/my/stats', authorize('student'), getMyComplaintStats);
router.get('/my', authorize('student'), getMyComplaints);
router.get('/:id', getComplaintById);

module.exports = router;
