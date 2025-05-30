import '../dashboard/ins_course.css';

export default function CourseCard({ course, onEdit, onDelete }) {
  return (
    <div className="course-card">
      <img
        src={course.thumbnail || 'https://via.placeholder.com/300x180'}
        alt="Course Thumbnail"
      />
      <div className="course-card-content">
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        <button className="button" onClick={() => onEdit(course)}>Edit</button>
        <button className="button danger" onClick={() => onDelete(course._id)}>Delete</button>
      </div>
    </div>
  );
}
