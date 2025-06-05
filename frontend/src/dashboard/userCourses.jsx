import React, { useState, useEffect } from 'react';
import { Eye, Star, Clock, Users, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './userCourses.css';

const UserCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    'All Categories',
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
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/courses/published', {
        headers: {
          'Content-Type': 'application/json'
        }
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

  const handleViewCourse = (course) => {
    navigate('/course-details', { 
      state: { 
        course: course,
        courseId: course._id 
      } 
    });
  };

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === '' || selectedCategory === 'All Categories' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="user-courses">
      <div className="courses-header">
        <h1>Explore Courses</h1>
        <p>Discover amazing courses and expand your knowledge</p>
      </div>

      {/* Search and Filter Section */}
      <div className="courses-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Courses Grid */}
      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading courses...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="empty-state">
          <h3>No courses found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <div key={course._id} className="course-card">
              {course.thumbnail && (
                <div className="course-thumbnail">
                  <img src={course.thumbnail} alt={course.title} />
                  <div className="course-overlay">
                    <button
                      className="view-course-btn"
                      onClick={() => handleViewCourse(course)}
                    >
                      <Eye size={16} />
                      View Course
                    </button>
                  </div>
                </div>
              )}
              <div className="course-content">
                <div className="course-category">
                  <span className="category-badge">{course.category}</span>
                </div>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description}</p>
                
                <div className="course-meta">
                  <div className="course-stats">
                    <span className="stat">
                      <Users size={14} />
                      {course.enrolledStudents || 0} students
                    </span>
                    <span className="stat">
                      <Clock size={14} />
                      {course.duration || 'Self-paced'}
                    </span>
                    {course.rating && (
                      <span className="stat">
                        <Star size={14} />
                        {course.rating}
                      </span>
                    )}
                  </div>
                </div>

                <div className="course-tags">
                  {course.tags?.slice(0, 3).map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                  {course.tags?.length > 3 && (
                    <span className="tag-more">+{course.tags.length - 3} more</span>
                  )}
                </div>

                <div className="course-price">
                  {course.discountPrice > 0 ? (
                    <div className="price-with-discount">
                      <span className="current-price">${course.discountPrice}</span>
                      <span className="original-price">${course.price}</span>
                      <span className="discount-badge">
                        {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% OFF
                      </span>
                    </div>
                  ) : (
                    <span className="current-price">${course.price}</span>
                  )}
                </div>

                <button
                  className="enroll-btn"
                  onClick={() => handleViewCourse(course)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Info */}
      {!loading && (
        <div className="results-info">
          <p>Showing {filteredCourses.length} of {courses.length} courses</p>
        </div>
      )}
    </div>
  );
};

export default UserCourses;