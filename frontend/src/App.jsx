import Header from "./components/header/Header";
import VideoUploadPage from "./dashboard/instructorVideo";
import { Route,Routes } from "react-router-dom";
import AuthApp from "./pages/authPage";
// import InstructorCourses from "./dashboard/instructorCourse";

function App  () {
  return (
   <>
    <Routes>
      <Route path="/" element={<Header />} />
      <Route path="/upload" element={<VideoUploadPage />} />
      <Route path="/authentication" element={<AuthApp />} />
    </Routes>
   </>
  );
};

export default App;