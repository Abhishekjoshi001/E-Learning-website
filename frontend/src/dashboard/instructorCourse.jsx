import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Upload, Save, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Add this import
import './instructorCourse.css';

const InstructorCourse = () => {
  const navigate = useNavigate(); // Add this hook
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    tags: '',
    thumbnail: '',
    isPublished: false
  });

  // Mock auth token - replace with your actual auth implementation
  const authToken = localStorage.getItem('authToken') || 'your-jwt-token';
  console.log("This is the jwt token:", authToken);

  const categories = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'UI/UX Design',
    'Digital Marketing',
    'Business',
    'Photography',
    'Music',
    'Other'
  ];

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  const fetchInstructorCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/courses/', {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'

        },
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
      } else {
        setError('Failed to fetch courses');
      }
    } catch (error) {
      setError('Error fetching courses: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    try {
      const courseData = {
        ...courseForm,
        price: parseFloat(courseForm.price),
        discountPrice: parseFloat(courseForm.discountPrice) || 0,
        tags: courseForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await fetch('http://localhost:8000/api/courses/create', {
        method: 'POST',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(courseData)
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Course created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchInstructorCourses();
      } else {
        setError('Failed to create course: ' + data.message);
      }
    } catch (error) {
      setError('Error creating course: ' + error.message);
    }
  };

  const handleUpdateCourse = async () => {
    try {
      const courseData = {
        ...courseForm,
        price: parseFloat(courseForm.price),
        discountPrice: parseFloat(courseForm.discountPrice) || 0,
        tags: courseForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await fetch(`http://localhost:8000/api/courses/${selectedCourse._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(courseData)
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Course updated successfully!');
        setShowEditModal(false);
        resetForm();
        fetchInstructorCourses();
      } else {
        setError('Failed to update course: ' + data.message);
      }
    } catch (error) {
      setError('Error updating course: ' + error.message);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Course deleted successfully!');
        fetchInstructorCourses();
      } else {
        setError('Failed to delete course: ' + data.message);
      }
    } catch (error) {
      setError('Error deleting course: ' + error.message);
    }
  };

  const handleThumbnailUpload = async (file) => {
    if (!file) return;

    try {
      setThumbnailUploading(true);

      // Get upload URL
      const uploadResponse = await fetch('http://localhost:8000/api/courses/thumbnail-url', {
        method: 'POST',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          contentType: file.type,
          filename: file.name
        })
      });

      const uploadData = await uploadResponse.json();
      if (!uploadData.success) {
        throw new Error('Failed to get upload URL');
      }

      // Upload file to cloud storage
      await fetch(uploadData.data.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type
        },
        // credentials: 'include',
        body: file
      });

      // Update form with thumbnail URL
      console.log(uploadData.data.key);
      const thumbnailUrl = `https://ed-learning-videos.s3.wasabisys.com/${uploadData.data.key}`;
      setCourseForm(prev => ({ ...prev, thumbnail: thumbnailUrl }));

    } catch (error) {
      setError('Error uploading thumbnail: ' + error.message);
    } finally {
      setThumbnailUploading(false);
    }
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      price: course.price.toString(),
      discountPrice: course.discountPrice?.toString() || '',
      category: course.category,
      tags: course.tags?.join(', ') || '',
      thumbnail: course.thumbnail || '',
      isPublished: course.isPublished || false
    });
    setShowEditModal(true);
  };

  // Add this new function to handle view course navigation
  const handleViewCourse = (course) => {
    // Navigate to /viewCourse and pass the course data as state
    navigate('/viewCourse', { 
      state: { 
        course: course,
        courseId: course._id 
      } 
    });
  };

  const resetForm = () => {
    setCourseForm({
      title: '',
      description: '',
      price: '',
      discountPrice: '',
      category: '',
      tags: '',
      thumbnail: '',
      isPublished: false
    });
    setSelectedCourse(null);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    resetForm();
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="instructor-dashboard">
      <div className="dashboard-header">
        <h1>My Courses</h1>
        <button
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={20} />
          Create New Course
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Courses Grid */}
      {loading ? (
        <div className="loading">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <h3>No courses yet</h3>
          <p>Create your first course to get started!</p>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course._id} className="course-card">
              {course.thumbnail && (
                <div className="course-thumbnail">
                  <img src={course.thumbnail} alt={course.title} />
                </div>
              )}
              <div className="course-content">
                <h3>{course.title}</h3>
                <p className="course-description">{course.description}</p>
                <div className="course-meta">
                  <span className="category">{course.category}</span>
                  <span className="price">${course.price}</span>
                  {course.discountPrice > 0 && (
                    <span className="discount-price">${course.discountPrice}</span>
                  )}
                </div>
                <div className="course-status">
                  <span className={`status ${course.isPublished ? 'published' : 'draft'}`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="course-tags">
                  {course.tags?.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="course-actions">
                <button
                  className="btn-icon"
                  onClick={() => handleViewCourse(course)}
                  title="View Course"
                >
                  <Eye size={16} />
                </button>
                <button
                  className="btn-icon"
                  onClick={() => openEditModal(course)}
                  title="Edit Course"
                >
                  <Edit size={16} />
                </button>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => handleDeleteCourse(course._id)}
                  title="Delete Course"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New Course</h2>
              <button className="btn-close" onClick={closeModals}>
                <X size={20} />
              </button>
            </div>
            <div className="course-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Discount Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={courseForm.discountPrice}
                    onChange={(e) => setCourseForm({ ...courseForm, discountPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={courseForm.tags}
                  onChange={(e) => setCourseForm({ ...courseForm, tags: e.target.value })}
                  placeholder="React, JavaScript, Web Development"
                />
              </div>

              <div className="form-group">
                <label>Thumbnail</label>
                <div className="thumbnail-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleThumbnailUpload(e.target.files[0])}
                    disabled={thumbnailUploading}
                  />
                  {thumbnailUploading && <span>Uploading...</span>}
                  {courseForm.thumbnail && (
                    <img src={courseForm.thumbnail} alt="Thumbnail preview" className="thumbnail-preview" />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={courseForm.isPublished}
                    onChange={(e) => setCourseForm({ ...courseForm, isPublished: e.target.checked })}
                  />
                  Publish immediately
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModals}>
                  Cancel
                </button>
                <button type="button" className="btn-primary" onClick={handleCreateCourse}>
                  <Save size={16} />
                  Create Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <button type="button" className="btn-primary" onClick={() => navigate('/uploadVideos')}>
        <Save size={16} />
        Upload videos
      </button>

      {/* Edit Course Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Course</h2>
              <button className="btn-close" onClick={closeModals}>
                <X size={20} />
              </button>
            </div>
            <div className="course-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Discount Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={courseForm.discountPrice}
                    onChange={(e) => setCourseForm({ ...courseForm, discountPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={courseForm.tags}
                  onChange={(e) => setCourseForm({ ...courseForm, tags: e.target.value })}
                  placeholder="React, JavaScript, Web Development"
                />
              </div>

              <div className="form-group">
                <label>Thumbnail</label>
                <div className="thumbnail-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleThumbnailUpload(e.target.files[0])}
                    disabled={thumbnailUploading}
                  />
                  {thumbnailUploading && <span>Uploading...</span>}
                  {courseForm.thumbnail && (
                    <img src={courseForm.thumbnail} alt="Thumbnail preview" className="thumbnail-preview" />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={courseForm.isPublished}
                    onChange={(e) => setCourseForm({ ...courseForm, isPublished: e.target.checked })}
                  />
                  Published
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModals}>
                  Cancel
                </button>
                <button type="button" className="btn-primary" onClick={handleUpdateCourse}>
                  <Save size={16} />
                  Update Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorCourse;