import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../index.css';
import './instructorVideo.css';
import { useNavigate } from 'react-router-dom';

// API endpoints - Updated to match your backend
const API_BASE_URL = 'http://localhost:8000/api'; // Updated to match your server
const API = {
  UPLOAD_URL: `${API_BASE_URL}/videos/upload-url`,
  CREATE_VIDEO: `${API_BASE_URL}/videos`,
  COURSE_VIDEOS: (courseId) => `${API_BASE_URL}/videos/course/${courseId}`,
  DELETE_VIDEO: (videoId) => `${API_BASE_URL}/videos/${videoId}`,
  UPDATE_VIDEO: (videoId) => `${API_BASE_URL}/videos/${videoId}`,
  STREAM_VIDEO: (videoId) => `${API_BASE_URL}/videos/stream/${videoId}`,
  COURSES: `${API_BASE_URL}/courses`,
};

// Helper function for authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token'); // Adjust based on how you store your token
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Format file size helper
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format duration helper
const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const VideoUploadPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef();
  
  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(API.COURSES, getAuthHeaders());
        const coursesData = response.data.data || response.data;
        setCourses(coursesData);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
      }
    };
    
    fetchCourses();
  }, []);
  
  // Load videos when course is selected
  useEffect(() => {
    if (selectedCourse) {
      fetchCourseVideos(selectedCourse);
    }
  }, [selectedCourse]);
  
  const fetchCourseVideos = async (courseId) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(API.COURSE_VIDEOS(courseId), getAuthHeaders());
      const videosData = response.data.data || response.data;
      setVideos(videosData);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
    }
  };
  
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
    }
  };
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTags('');
    setVideoFile(null);
    setThumbnailFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCourse) {
      alert('Please select a course');
      return;
    }
    
    if (!videoFile) {
      alert('Please select a video file');
      return;
    }
    
    setShowProgress(true);
    setUploadProgress(0);
    setUploadStatus('Requesting upload URL...');
    
    try {
      // Step 1: Get pre-signed upload URL
      const urlResponse = await axios.put(API.UPLOAD_URL, {
        contentType: videoFile.type,
        filename: videoFile.name
      }, getAuthHeaders());
      
      const { uploadUrl, key } = urlResponse.data.data;
      
      setUploadStatus('Uploading video to storage...');
      setUploadProgress(20);
      
      // Step 2: Upload video directly to Wasabi
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: videoFile,
        headers: {
          'Content-Type': videoFile.type
        }
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload video to storage');
      }
      
      setUploadProgress(80);
      setUploadStatus('Creating video record...');
      
      // Step 3: Create video record
      let thumbnailUrl = null;
      
      // If there's a thumbnail, you would upload it here
      // This would need to be implemented based on your backend thumbnail upload functionality
      if (thumbnailFile) {
        // Example thumbnail upload logic - adjust based on your API
        const thumbFormData = new FormData();
        thumbFormData.append('thumbnail', thumbnailFile);
        
        // This is just a placeholder - implement according to your backend
        // const thumbResponse = await axios.post(`${API_BASE_URL}/thumbnails/upload`, 
        //   thumbFormData, getAuthHeaders());
        // thumbnailUrl = thumbResponse.data.thumbnailUrl;
      }
      
      // Duration will be determined by the backend in most cases
      // If your backend expects a duration, you'd need to calculate it client-side
      
      const createResponse = await axios.post(API.CREATE_VIDEO, {
        title,
        description,
        courseId: selectedCourse,
        wasabiKey: key,
        thumbnailUrl,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }, getAuthHeaders());
      
      setUploadProgress(100);
      setUploadStatus('Video uploaded successfully!');
      
      // Reset form
      resetForm();
      
      // Refresh video list
      if (selectedCourse) {
        fetchCourseVideos(selectedCourse);
      }
      
      // Hide progress after 3 seconds
      setTimeout(() => {
        setShowProgress(false);
      }, 3000);
      
    } catch (err) {
      console.error('Upload error:', err);
      setUploadStatus(`Error: ${err.message || 'Upload failed'}`);
      setUploadProgress(0);
    }
  };
  
  const handleWatchVideo = (videoId) => {
    // Get streaming URL and play video
    // This implementation depends on how your video player is set up
    window.open(API.STREAM_VIDEO(videoId), '_blank');
    // Alternatively:
    // navigate(`/videos/watch/${videoId}`);
  };
  
  const handleEditVideo = (videoId) => {
    navigate(`/videos/edit/${videoId}`);
  };
  
  const handleDeleteVideo = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await axios.delete(API.DELETE_VIDEO(videoId), getAuthHeaders());
        alert('Video deleted successfully');
        
        // Refresh video list
        fetchCourseVideos(selectedCourse);
      } catch (err) {
        console.error('Error deleting video:', err);
        alert(`Failed to delete video: ${err.message}`);
      }
    }
  };
  
  return (
    <div className="video-upload-container">
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">Video Upload Portal</h1>
        </div>
      </header>
      
      <main className="main-content">
        <div className="content-container">
          {/* Course Selection */}
          <div className="panel course-selection">
            <h2 className="panel-title">Select Course</h2>
            <select 
              className="course-select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">-- Select a course --</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.title}</option>
              ))}
            </select>
          </div>
          
          {/* Video Upload Form */}
          <div className="panel upload-form">
            <h2 className="panel-title">Upload Video</h2>
            
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Video Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  rows="3"
                  className="form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="tags" className="form-label">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  className="form-input"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. html, css, beginners"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Video File
                </label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="video/*"
                    className="file-input"
                    onChange={handleVideoFileChange}
                    required
                  />
                </div>
                {videoFile && (
                  <p className="file-info">
                    {videoFile.name} ({formatFileSize(videoFile.size)})
                  </p>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Thumbnail (Optional)
                </label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    className="file-input"
                    onChange={handleThumbnailChange}
                  />
                </div>
                {thumbnailFile && (
                  <p className="file-info">
                    {thumbnailFile.name} ({formatFileSize(thumbnailFile.size)})
                  </p>
                )}
              </div>
              
              <div className="form-submit">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={!videoFile || !selectedCourse}
                >
                  Upload Video
                </button>
              </div>
            </form>
            
            {/* Upload Progress */}
            {showProgress && (
              <div className="progress-container">
                <h3 className="progress-status">{uploadStatus}</h3>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Videos List */}
          {selectedCourse && (
            <div className="panel video-list">
              <h2 className="panel-title">Course Videos</h2>
              
              {loading ? (
                <p className="status-message">Loading videos...</p>
              ) : error ? (
                <p className="error-message">{error}</p>
              ) : videos.length === 0 ? (
                <p className="status-message empty">No videos found for this course.</p>
              ) : (
                <div className="videos-container">
                  {videos.map(video => (
                    <div key={video._id} className="video-item">
                      <div className="video-details">
                        <h3 className="video-title">{video.title}</h3>
                        <p className="video-description">{video.description}</p>
                        <div className="video-meta">
                          <span>{formatDuration(video.duration || 0)}</span>
                          <span className="meta-separator">•</span>
                          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="video-actions">
                        <button
                          onClick={() => handleWatchVideo(video._id)}
                          className="action-button watch"
                        >
                          Watch
                        </button>
                        <button
                          onClick={() => handleEditVideo(video._id)}
                          className="action-button edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(video._id)}
                          className="action-button delete"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VideoUploadPage;