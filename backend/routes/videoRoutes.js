import express from 'express';
import {getCourseVideos,getStreamingUrl,getUploadUrl,createVideo,updateVideo,deleteVideo} from '../controllers/videoController.js';
import { auth, instructor } from '../middlewares/auth.js';
import { videoUpload, validateFileType } from '../middlewares/upload.js';

const router = express.Router();

// Route for generating pre-signed upload URL
router.post('/upload-url', auth, getUploadUrl);

// Create a new video (after upload to Wasabi)
router.post('/', auth, instructor, createVideo);

// Get videos for a specific course
router.get('/course/:courseId', auth, getCourseVideos);

// Get streaming URL for a specific video
router.get('/stream/:id', auth, getStreamingUrl);

// Update video details
router.put('/:id', auth, instructor, updateVideo);

// Delete a video
router.delete('/:id', auth, instructor, deleteVideo);

export default router;