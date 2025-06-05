import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Users, 
  Star, 
  Tag, 
  DollarSign, 
  CheckCircle,
  Video,
  ShoppingCart
} from 'lucide-react';
import './viewCourse.css';

const ViewCourse = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { course, courseId } = location.state || {};
  
  const [courseDetails, setCourseDetails] = useState(course || null);
  const [loading, setLoading] = useState(!course);
  const [error, setError] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);

  // If no course data passed through state, fetch it
  useEffect(() => {
    if (!course && courseId) {
      fetchCourseDetails();
    }
  }, [courseId, course]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:8000/api/courses/${courseId}`, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        setCourseDetails(data.data);
      } else {
        setError('Failed to fetch course details');
      }
    } catch (error) {
      setError('Error fetching course details: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseCourse = async () => {
    try {
      setIsPurchasing(true);
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:8000/api/courses/${courseDetails._id}/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        alert('Course purchased successfully!');
        // You might want to redirect to a success page or update the UI
        // navigate('/my-courses');
      } else {
        alert('Failed to purchase course: ' + data.message);
      }
    } catch (error) {
      alert('Error purchasing course: ' + error.message);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleViewVideos = () => {
    navigate('/course-videos', {
      state: {
        course: courseDetails,
        courseId: courseDetails._id
      }
    });
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="view-course-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !courseDetails) {
    return (
      <div className="view-course-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error || 'Course not found'}</p>
          <button className="btn-primary" onClick={handleGoBack}>
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const discountPercentage = courseDetails.discountPrice > 0 
    ? Math.round(((courseDetails.price - courseDetails.discountPrice) / courseDetails.price) * 100)
    : 0;

  return (
    <div className="view-course-container">
      {/* Header */}
      <header className="course-header">
        <button className="back-button" onClick={handleGoBack}>
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleViewVideos}>
            <Video size={16} />
            View Videos
          </button>
        </div>
      </header>

      {/* Course Hero Section */}
      <section className="course-hero">
        <div className="hero-content">
          <div className="course-info">
            <div className="course-category">
              <Tag size={16} />
              {courseDetails.category}
            </div>
            
            <h1 className="course-title">{courseDetails.title}</h1>
            
            <p className="course-description">{courseDetails.description}</p>
            
            <div className="course-meta">
              <div className="meta-item">
                <Users size={16} />
                <span>1.2k Students</span>
              </div>
              <div className="meta-item">
                <Clock size={16} />
                <span>12 Hours</span>
              </div>
              <div className="meta-item">
                <Star size={16} />
                <span>4.8 (234 reviews)</span>
              </div>
              <div className="meta-item">
                <CheckCircle size={16} />
                <span className={`status ${courseDetails.isPublished ? 'published' : 'draft'}`}>
                  {courseDetails.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>

            {/* Tags */}
            {courseDetails.tags && courseDetails.tags.length > 0 && (
              <div className="course-tags">
                <h3>What you'll learn:</h3>
                <div className="tags-container">
                  {courseDetails.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="course-thumbnail-section">
            {courseDetails.thumbnail && (
              <div className="course-thumbnail-large">
                <img src={courseDetails.thumbnail} alt={courseDetails.title} />
                <div className="play-overlay">
                  <Play size={48} />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="course-content">
        <div className="content-grid">
          {/* Main Content */}
          <div className="main-content">
            <div className="content-section">
              <h2>About This Course</h2>
              <p>{courseDetails.description}</p>
            </div>

            <div className="content-section">
              <h2>Course Curriculum</h2>
              <div className="curriculum-placeholder">
                <p>📚 Comprehensive curriculum coming soon...</p>
                <p>This course includes:</p>
                <ul>
                  <li>✅ HD Video Lectures</li>
                  <li>✅ Downloadable Resources</li>
                  <li>✅ Lifetime Access</li>
                  <li>✅ Certificate of Completion</li>
                  <li>✅ 30-Day Money Back Guarantee</li>
                </ul>
              </div>
            </div>

            <div className="content-section">
              <h2>Instructor</h2>
              <div className="instructor-info">
                <div className="instructor-avatar">
                  <div className="avatar-placeholder">
                    <Users size={24} />
                  </div>
                </div>
                <div className="instructor-details">
                  <h3>Course Instructor</h3>
                  <p>Expert in {courseDetails.category}</p>
                  <div className="instructor-stats">
                    <span>⭐ 4.9 Instructor Rating</span>
                    <span>👥 10k+ Students</span>
                    <span>🎓 50+ Courses</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="course-sidebar">
            <div className="price-card">
              <div className="price-section">
                {courseDetails.discountPrice > 0 ? (
                  <div className="price-with-discount">
                    <span className="current-price">${courseDetails.discountPrice}</span>
                    <span className="original-price">${courseDetails.price}</span>
                    <span className="discount-badge">{discountPercentage}% OFF</span>
                  </div>
                ) : (
                  <span className="current-price">${courseDetails.price}</span>
                )}
              </div>

              <div className="course-includes">
                <h4>This course includes:</h4>
                <ul>
                  <li><Video size={16} /> 12 hours on-demand video</li>
                  <li><CheckCircle size={16} /> Certificate of completion</li>
                  <li><Clock size={16} /> Lifetime access</li>
                  <li><Users size={16} /> Access on mobile and TV</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fixed Bottom Action Bar */}
      <div className="bottom-action-bar">
        <div className="action-content">
          <div className="price-summary">
            {courseDetails.discountPrice > 0 ? (
              <>
                <span className="final-price">${courseDetails.discountPrice}</span>
                <span className="crossed-price">${courseDetails.price}</span>
              </>
            ) : (
              <span className="final-price">${courseDetails.price}</span>
            )}
          </div>
          
          <div className="action-buttons">
            <button 
              className="btn-primary purchase-btn"
              onClick={handlePurchaseCourse}
              disabled={isPurchasing}
            >
              <ShoppingCart size={16} />
              {isPurchasing ? 'Processing...' : 'Purchase Course'}
            </button>
            
            <button className="btn-secondary videos-btn" onClick={handleViewVideos}>
              <Video size={16} />
              View Videos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCourse;