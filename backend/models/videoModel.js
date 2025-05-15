import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description: {
        type: String,
        required: true
      },
    duration: {
        type: Number, // in seconds
        required: true
      },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
      },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
    wasabiKey: {
        type: String,
        required: true
      },
    thumbnailUrl: {
        type: String,
        default: null
      },
    transcoding: {
        status: {
          type: String,
          enum: ['pending', 'processing', 'completed', 'failed'],
          default: 'pending'
        },
        formats: [{
          quality: String,
          path: String
        }]
      },
    isPublished: {
        type: Boolean,
        default: false
      },
      tags: [String],
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
});

videoSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Video = mongoose.model('Video', videoSchema);
export default Video;