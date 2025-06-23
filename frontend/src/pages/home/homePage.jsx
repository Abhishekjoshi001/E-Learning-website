// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './HomePage.css';

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const authToken = localStorage.getItem('authToken') || '';

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

  const instructors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      role: "Senior VLSI Design Engineer",
      bio: "15+ years of experience in semiconductor industry with expertise in analog and digital VLSI design.",
      avatar: "SJ"
    },
    {
      id: 2,
      name: "Prof. Michael Chen",
      role: "VLSI Research Specialist",
      bio: "Leading researcher in advanced CMOS technologies and low-power design methodologies.",
      avatar: "MC"
    }
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-deco chip-1" />
        <div className="hero-deco chip-2" />
        <div className="hero-content" data-aos="fade-down">
          <h1>Master VLSI Design</h1>
          <p>
            Welcome to the premier e-learning platform dedicated to VLSI (Very Large Scale Integration)
            education. Learn from industry experts and advance your career in semiconductor design
            with our comprehensive courses covering digital design, analog circuits, and cutting-edge technologies.
          </p>
          <Link to="/courses" className="cta-button">
            Start Learning Today
          </Link>
        </div>
      </section>

      {/* Instructors Section */}
      <section className="instructors-section">
        <div className="container">
          <h2 className="section-title" data-aos="fade-up">Meet Our Expert Instructors</h2>
          <div className="instructors-grid">
            {instructors.map(instructor => (
              <div key={instructor.id} className="instructor-card" data-aos="fade-up">
                <div className="instructor-avatar">{instructor.avatar}</div>
                <h3 className="instructor-name">{instructor.name}</h3>
                <p className="instructor-role">{instructor.role}</p>
                <p className="instructor-bio">{instructor.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="courses-section">
        <div className="container">
          <div className="courses-header" data-aos="fade-up">
            <h2 className="section-title">Featured Courses</h2>
            <Link to="/courses" className="view-all-btn">View All Courses</Link>
          </div>

          {loading ? (
            <div className="loading-state"><p>Loading courses...</p></div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchCourses} className="retry-btn">Try Again</button>
            </div>
          ) : courses.length === 0 ? (
            <div className="empty-state"><p>No courses available at the moment.</p></div>
          ) : (
            <div className="courses-grid">
              {courses.slice(0, 4).map(course => (
                <div key={course.id || course._id} className="course-card" data-aos="fade-up">
                  <div className="course-image">📚</div>
                  <div className="course-content">
                    <h3 className="course-title">{course.title || course.name}</h3>
                    <p className="course-description">{course.description}</p>
                    <div className="course-meta">
                      <span>{course.duration || 'N/A'}</span>
                      <span>{course.level || course.difficulty || 'All Levels'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
