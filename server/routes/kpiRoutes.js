import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  saveConfig,
  loadConfig,
  listConfigs,
  handleFileUpload
} from '../controllers/kpiController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'server/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /xlsx|xls/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only Excel files are allowed'));
  }
});

// KPI Configuration Routes
router.post('/saveConfig', saveConfig);
router.get('/loadConfig/:id', loadConfig);
router.get('/listConfigs', listConfigs);
router.post('/uploadFile', upload.single('file'), handleFileUpload);

export default router;