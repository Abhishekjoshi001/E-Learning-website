import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type';

// Configure storage
const storage = multer.memoryStorage();

// File filter to validate uploads
const fileFilter = async (req, file, cb) => {
  try {
    // Allow only certain file types
    const allowedVideoTypes = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime'
    ];
    
    const allowedImageTypes = [
      'image/jpeg',
      'image/png', 
      'image/webp',
      'image/gif'
    ];
    
    // Check file type based on upload type (video or thumbnail)
    const uploadType = req.path.includes('thumbnail') ? 'image' : 'video';
    const allowedTypes = uploadType === 'image' ? allowedImageTypes : allowedVideoTypes;
    
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type. Only ${uploadType} files are allowed.`), false);
    }
    
    cb(null, true);
  } catch (error) {
    cb(new Error('Error validating file type'), false);
  }
};

// Create multer instance with configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max file size for videos
  }
});

// Middleware for video uploads
export const videoUpload = upload.single('video');

// Middleware for thumbnail uploads
export const thumbnailUpload = upload.single('thumbnail');

// Middleware to validate file type after upload (additional check)
export const validateFileType = async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  
  try {
    // Check file type from buffer
    const fileInfo = await fileTypeFromBuffer(req.file.buffer);
    
    if (!fileInfo) {
      return res.status(400).json({
        success: false,
        message: 'Could not determine file type'
      });
    }
    
    // Validate based on upload type
    const isVideoUpload = req.path.includes('videos');
    const isImageUpload = req.path.includes('thumbnail');
    
    const validVideoTypes = ['mp4', 'webm', 'ogg', 'mov', 'quicktime'];
    const validImageTypes = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    
    if (isVideoUpload && !validVideoTypes.includes(fileInfo.ext)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid video file type'
      });
    }
    
    if (isImageUpload && !validImageTypes.includes(fileInfo.ext)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image file type'
      });
    }
    
    // Add file info to request
    req.fileType = fileInfo;
    next();
  } catch (error) {
    console.error('Error validating file type:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating file type',
      error: error.message
    });
  }
};