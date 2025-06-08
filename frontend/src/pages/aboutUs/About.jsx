import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Award, 
  Target, 
  Heart, 
  Lightbulb,
  ChevronRight,
  Play,
  Star,
  Globe,
  Shield,
  Zap
} from 'lucide-react';
import './about.css';

const About = () => {
  const [activeTab, setActiveTab] = useState('mission');
  const [counters, setCounters] = useState({
    students: 0,
    courses: 0,
    instructors: 0,
    countries: 0
  });

  // Animated counter effect
  useEffect(() => {
    const targetValues = {
      students: 50000,
      courses: 1200,
      instructors: 850,
      countries: 45
    };

    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setCounters({
        students: Math.floor(targetValues.students * progress),
        courses: Math.floor(targetValues.courses * progress),
        instructors: Math.floor(targetValues.instructors * progress),
        countries: Math.floor(targetValues.countries * progress)
      });

      if (step >= steps) {
        clearInterval(interval);
        setCounters(targetValues);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "CEO & Co-Founder",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b93c?w=300&h=300&fit=crop&crop=face",
      bio: "Former education director with 15+ years of experience in transforming learning experiences."
    },
    {
      name: "Michael Chen",
      role: "CTO & Co-Founder",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      bio: "Tech visionary with expertise in AI and educational technology platforms."
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Head of Curriculum",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face",
      bio: "PhD in Educational Psychology, specializing in personalized learning methodologies."
    },
    {
      name: "David Kim",
      role: "Head of Engineering",
      image: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=300&h=300&fit=crop&crop=face",
      bio: "Full-stack engineer passionate about building scalable educational platforms."
    }
  ];

  const values = [
    {
      icon: <Heart className="value-icon" />,
      title: "Student-Centered",
      description: "Every decision we make puts our learners first, ensuring their success and growth."
    },
    {
      icon: <Lightbulb className="value-icon" />,
      title: "Innovation",
      description: "We constantly evolve our platform using cutting-edge technology and pedagogical research."
    },
    {
      icon: <Globe className="value-icon" />,
      title: "Accessibility",
      description: "Quality education should be available to everyone, everywhere, regardless of background."
    },
    {
      icon: <Shield className="value-icon" />,
      title: "Trust & Safety",
      description: "We maintain the highest standards of security and create safe learning environments."
    },
    {
      icon: <Zap className="value-icon" />,
      title: "Excellence",
      description: "We strive for excellence in every course, feature, and interaction on our platform."
    },
    {
      icon: <Users className="value-icon" />,
      title: "Community",
      description: "Learning is better together. We foster connections between learners and educators."
    }
  ];

  const milestones = [
    {
      year: "2019",
      title: "Founded",
      description: "Started with a vision to democratize quality education"
    },
    {
      year: "2020",
      title: "First 1,000 Students",
      description: "Reached our first major milestone during the pandemic"
    },
    {
      year: "2021",
      title: "Global Expansion",
      description: "Launched in 20+ countries with multilingual support"
    },
    {
      year: "2022",
      title: "AI Integration",
      description: "Introduced personalized learning paths with AI"
    },
    {
      year: "2023",
      title: "50,000+ Students",
      description: "Became one of the fastest-growing education platforms"
    },
    {
      year: "2024",
      title: "Enterprise Solutions",
      description: "Launched corporate training and university partnerships"
    }
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Transforming Education for the Digital Age</h1>
            <p>
              We're on a mission to make quality education accessible to everyone, everywhere. 
              Through innovative technology and expert instruction, we're building the future of learning.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary">
                <Play size={20} />
                Watch Our Story
              </button>
              <button className="btn-secondary">
                Join Our Mission
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="hero-image">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop" 
              alt="Students learning together"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">{counters.students.toLocaleString()}+</div>
            <div className="stat-label">Active Students</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{counters.courses.toLocaleString()}+</div>
            <div className="stat-label">Courses Available</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{counters.instructors.toLocaleString()}+</div>
            <div className="stat-label">Expert Instructors</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{counters.countries}+</div>
            <div className="stat-label">Countries Served</div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values Tabs */}
      <section className="mission-section">
        <div className="section-header">
          <h2>Our Purpose</h2>
          <p>Understanding what drives us and where we're headed</p>
        </div>
        
        <div className="tabs-container">
          <div className="tab-buttons">
            <button 
              className={`tab-button ${activeTab === 'mission' ? 'active' : ''}`}
              onClick={() => setActiveTab('mission')}
            >
              <Target size={20} />
              Mission
            </button>
            <button 
              className={`tab-button ${activeTab === 'vision' ? 'active' : ''}`}
              onClick={() => setActiveTab('vision')}
            >
              <Award size={20} />
              Vision
            </button>
            <button 
              className={`tab-button ${activeTab === 'values' ? 'active' : ''}`}
              onClick={() => setActiveTab('values')}
            >
              <Heart size={20} />
              Values
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'mission' && (
              <div className="tab-panel">
                <h3>Our Mission</h3>
                <p>
                  To democratize access to world-class education by creating an inclusive, 
                  innovative, and engaging learning platform that empowers individuals to 
                  achieve their full potential and contribute meaningfully to society.
                </p>
                <ul>
                  <li>Make quality education accessible to all</li>
                  <li>Bridge the global skills gap</li>
                  <li>Foster lifelong learning habits</li>
                  <li>Create opportunities for career advancement</li>
                </ul>
              </div>
            )}

            {activeTab === 'vision' && (
              <div className="tab-panel">
                <h3>Our Vision</h3>
                <p>
                  To be the world's leading education platform where learners from every 
                  background can discover, develop, and demonstrate their talents through 
                  personalized, cutting-edge educational experiences.
                </p>
                <ul>
                  <li>Global leader in online education</li>
                  <li>Personalized learning for every student</li>
                  <li>Bridge between education and industry</li>
                  <li>Catalyst for social and economic mobility</li>
                </ul>
              </div>
            )}

            {activeTab === 'values' && (
              <div className="tab-panel values-grid">
                {values.map((value, index) => (
                  <div key={index} className="value-card">
                    {value.icon}
                    <h4>{value.title}</h4>
                    <p>{value.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="section-header">
          <h2>Meet Our Leadership Team</h2>
          <p>Passionate educators and technologists dedicated to transforming learning</p>
        </div>
        
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-image">
                <img src={member.image} alt={member.name} />
              </div>
              <div className="team-info">
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-bio">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline Section */}
      <section className="timeline-section">
        <div className="section-header">
          <h2>Our Journey</h2>
          <p>Key milestones that shaped our platform</p>
        </div>
        
        <div className="timeline">
          {milestones.map((milestone, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="timeline-year">{milestone.year}</div>
                <h3>{milestone.title}</h3>
                <p>{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Your Learning Journey?</h2>
          <p>
            Join thousands of learners who are already transforming their careers 
            and expanding their knowledge with our expert-led courses.
          </p>
          <div className="cta-buttons">
            <button className="btn-primary">
              <BookOpen size={20} />
              Browse Courses
            </button>
            <button className="btn-outline">
              Become an Instructor
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="cta-stats">
            <div className="cta-stat">
              <Star size={16} />
              <span>4.8/5 Average Rating</span>
            </div>
            <div className="cta-stat">
              <Users size={16} />
              <span>50,000+ Happy Students</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;