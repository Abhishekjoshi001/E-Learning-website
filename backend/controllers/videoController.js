import Video from "../models/videoModel.js";
import Course from "../models/courseModel.js";
import mongoose from "mongoose";
import cloudStorage from "../services/storageServices/index.js";
import Purchase from '../models/purchaseModel.js';
//Generate a pre-signed URL for direct video upload

export const getUploadUrl = async (req, res) => {
    try {
        const { contentType, filename } = req.body;

        if (!contentType || !filename) {
            return res.status(400).json({
                success: false,
                message: 'Content type and filename are required'
            });
        }

        const key = cloudStorage.generateKey(filename);
        const uploadUrl = await cloudStorage.getUploadUrl(key, contentType);

        res.status(200).json({
            success: true,
            data: {
                uploadUrl,
                key,
                expiresIn: 3600
            }
        });
    } catch (error) {
        console.error('Error generating upload URL:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate upload URL',
            error: error.message
        });
    }
};

//Create a new video entry after upload
export const createVideo = async (req, res) => {
    try {
        const {
            title,
            description,
            duration,
            courseId,
            wasabiKey,
            thumbnailUrl = null,
            tags = []
        } = req.body;

        if (!title || !description || !duration || !courseId || !wasabiKey) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid course ID'
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const fileExists = await cloudStorage.fileExists(wasabiKey);
        if (!fileExists) {
            return res.status(400).json({
                success: false,
                message: 'Video file not found in storage'
            });
        }

        const video = new Video({
            title,
            description,
            duration: parseInt(duration),
            courseId,
            instructor: req.user._id,
            wasabiKey,
            thumbnailUrl,
            tags,
            transcoding: {
                status: 'completed',
                formats: [{ quality: 'original', path: wasabiKey }]
            }
        });

        await video.save();

        await Course.findByIdAndUpdate(courseId, {
            $inc: { duration: parseInt(duration), totalVideos: 1 },
            updatedAt: Date.now()
        });

        res.status(201).json({
            success: true,
            data: video
        });
    } catch (error) {
        console.error('Error creating video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create video',
            error: error.message
        });
    }
};
//Get streaming URL
export const getStreamingUrl = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await Video.findById(id);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        const streamingUrl = await cloudStorage.getStreamingUrl(video.wasabiKey);

        res.status(200).json({
            success: true,
            data: {
                video,
                streamingUrl,
                expiresIn: 43200
            }
        });
    } catch (error) {
        console.error('Error getting streaming URL:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get streaming URL',
            error: error.message
        });
    }
};

//Get videos for a course
export const getCourseVideos = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID"
            });
        }

        const videos = await Video.find({ courseId, isPublished: false }).sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            count: videos.length,
            data: videos
        });
    } catch (error) {
        console.error("Error in getting videos:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to get course videos',
            error: error.message
        });
    }
};

//Update video details

export const updateVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, tags, isPublished, thumbnailUrl } = req.body;

        const video = await Video.findById(id);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: "Video not found"
            });
        }
        if (video.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this video'
            });
        }
        const updatedVideo = await Video.findByIdAndUpdate(id, {
            title: title || video.title,
            description: description || video.description,
            tags: tags || video.tags,
            isPublished: isPublished !== undefined ? isPublished : video.isPublished,
            thumbnailUrl: thumbnailUrl || video.thumbnailUrl,
            updatedAt: Date.now()
        }, { new: true });

        res.status(200).json({
            success: true,
            data: updateVideo
        });
    }catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update video',
          error: error.message
        });
    }
};

export const deleteVideo = async(req,res)=>{
    try{
        const{id} = req.params;

        const video = await Video.findById(id);
        if(!video){
            return res.status(404).json({
                status:false,
                message:"Video not found"
            });
        }
        if (video.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({
              success: false,
              message: 'Not authorized to delete this video'
            });
        }

        await cloudStorage.deleteFile(video.wasabiKey);
        await Video.findByIdAndDelete(id);
        await Course.findByIdAndUpdate(video.courseId,{
            $inc: { duration: -video.duration, totalVideos: -1 },
            updatedAt: Date.now()
        });
        res.status(200).json({
            success: true,
            message: 'Video deleted successfully'
        });
    }catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to delete video',
          error: error.message
        });
    }
};


export const streamVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;

    // Get video and course info
    const video = await Video.findById(videoId).populate('courseId');
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const course = video.courseId;

    // Check if course is free or user has purchased it
    if (!course.isFree && course.price > 0) {
      const purchase = await Purchase.findOne({
        userId,
        courseId: course._id,
        status: 'completed'
      });

      if (!purchase) {
        return res.status(403).json({ 
          message: 'Access denied. Please purchase the course first.' 
        });
      }
    }

    // Your existing video streaming logic here
    // ... rest of your streaming code
  } catch (error) {
    console.error('Video streaming error:', error);
    res.status(500).json({ message: 'Failed to stream video' });
  }
};
    