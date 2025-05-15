import express from 'express';
import {getCourse,getInstructorCourses,getThumbnailUploadUrl,getAllCourses,createCourse,updateCourse,deleteCourse} from '../controllers/courseController.js';
import { auth, instructor, admin } from '../middlewares/auth.js';
import { thumbnailUpload, validateFileType } from '../middlewares/upload.js';

const router = express.Router();

// Public routes
router.get('/', getAllCourses); // Get all published courses
router.get('/:id', getCourse); // Get a specific course with its videos

//Instructor routes (protected)
router.post('/create', auth, instructor, createCourse); // Create a new course
router.put('/:id', auth, instructor, updateCourse); // Update course details
router.delete('/:id', auth, instructor, deleteCourse); // Delete a course
router.get('/instructor/courses', auth, instructor, getInstructorCourses); // Get instructor's courses

// Thumbnail upload URL
router.post('/thumbnail-url', auth, instructor, getThumbnailUploadUrl);

export default router;