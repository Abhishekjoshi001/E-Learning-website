import Course from "../models/courseModel.js";
import Video from "../models/videoModel.js";
import mongoose from "mongoose";
import cloudStorage from "../services/storageServices/index.js";

export const createCourse = async (req, res) => {
    try {
        const { title, description, price, discountPrice = 0, category, tags = [], thumbnail = null } = req.body;
        if(!title || !description||!price||!category){
            return res.status(400).json({
                status:false,
                message:"All fields are required"
            });
        }

        const course = new Course({
            title,
            description,
            instructor: req.user._id, // Assuming authentication middleware sets req.user
            price: parseFloat(price),
            discountPrice: parseFloat(discountPrice),
            category,
            tags,
            thumbnail
        });

        await course.save();

        res.status(201).json({
            success:true,
            data:course
        })
    }catch(error){
        console.error('Error creating course:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to create course',
          error: error.message
        });
    }
};

export const getCourse = async(req,res)=>{
    try {
        const {id} = req.params;
        //Check if th courseId is valid
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success:false,
                message:"Invalidd course id"
            });
        }
        const course = await Course.findById(id);
        if(!course){
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        const videos = await Video.find({
            courseId:id,
            isPublished:true
        }).sort({createdAt:1});
        res.status(200).json({
            success: true,
            data: {
              ...course.toObject(),
              videos
            }
          });

    } catch (error) {
        console.error('Error getting course:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get course',
        error: error.message
      });
    }
};

export const getAllCourses = async (req, res) => {
    try {
        // First, check ALL courses without any filters
        const allCourses = await Course.find({}).lean();
        
        console.log("Total courses in database:", allCourses.length);
        
        if (allCourses.length > 0) {
            console.log("Sample course:", allCourses[0]);
        } else {
            console.log("No courses exist in the database at all");
        }

        // Return all courses for now, ignoring filters
        return res.status(200).json({
            success: true,
            count: allCourses.length,
            data: allCourses
        });
        
        // Original code follows below, but we're not executing it for now
        // ...
    } catch (error) {
        console.error('Error getting courses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get courses',
            error: error.message
        });
    }
};

export const updateCourse = async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        title, 
        description, 
        price, 
        discountPrice, 
        category, 
        tags,
        thumbnail,
        isPublished
      } = req.body;
      
      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      
      // Check if the user is the instructor of the course
      if (course.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this course'
        });
      }
      
      // Update fields
      const updateData = {
        updatedAt: Date.now()
      };
      
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (discountPrice !== undefined) updateData.discountPrice = parseFloat(discountPrice);
      if (category) updateData.category = category;
      if (tags) updateData.tags = tags;
      if (thumbnail) updateData.thumbnail = thumbnail;
      if (isPublished !== undefined) updateData.isPublished = isPublished;
      
      // Update course
      const updatedCourse = await Course.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      res.status(200).json({
        success: true,
        data: updatedCourse
      });
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update course',
        error: error.message
      });
    }
};

export const deleteCourse = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Find the course
      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      
      // Check if the user is the instructor of the course
      if (course.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this course'
        });
      }
      
      // Get all videos for the course
      const videos = await Video.find({ courseId: id });
      
      // Delete all video files from storage
      for (const video of videos) {
        try {
          await cloudStorage.deleteFile(video.wasabiKey);
          if (video.thumbnailUrl) {
            // Extract key from URL if needed
            const thumbnailKey = video.thumbnailUrl.split('/').pop();
            await cloudStorage.deleteFile(`thumbnails/${thumbnailKey}`);
          }
        } catch (err) {
          console.error(`Error deleting video file: ${video.wasabiKey}`, err);
        }
      }
      
      // Delete all videos associated with the course
      await Video.deleteMany({ courseId: id });
      
      // Delete the course itself
      await Course.findByIdAndDelete(id);
      
      res.status(200).json({
        success: true,
        message: 'Course and all associated videos deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete course',
        error: error.message
      });
    }
};

export const getThumbnailUploadUrl = async (req, res) => {
    try {
      const { contentType, filename } = req.body;
      
      if (!contentType || !filename) {
        return res.status(400).json({ 
          success: false, 
          message: 'Content type and filename are required' 
        });
      }
      
      // Generate unique key for the thumbnail
      const key = `thumbnails/${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${filename}`;
      
      // Get pre-signed upload URL
      const uploadUrl = await cloudStorage.getUploadUrl(key, contentType);
      
      res.status(200).json({
        success: true,
        data: {
          uploadUrl,
          key,
          expiresIn: 3600 // URL expiration in seconds
        }
      });
    } catch (error) {
      console.error('Error generating thumbnail upload URL:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate thumbnail upload URL',
        error: error.message
      });
    }
};

export const getInstructorCourses = async (req, res) => {
    try {
      const instructorId = req.user._id;
      
      const courses = await Course.find({ instructor: instructorId })
        .sort({ createdAt: -1 });
      
      res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
      });
    } catch (error) {
      console.error('Error getting instructor courses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get instructor courses',
        error: error.message
      });
    }
};
