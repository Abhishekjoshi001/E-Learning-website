import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate ,useLocation} from "react-router-dom";
import Header from "./components/header/Header";
import VideoUploadPage from "./dashboard/instructorVideo";
import InstructorCourse from "./dashboard/instructorCourse";
import StudentCourse from "./dashboard/userCourses";
import ViewCourse from "./pages/viewCourse";
import HomePage from "./pages/home/homePage";
import AuthApp from "./pages/authPage";
import About from "./pages/aboutUs/About";
import Footer from "./components/footer/Footer";

// import { getUserFromToken } from "../utils/getUserFromToken";

function App() {
    const location = useLocation(); 
  // const user = req.user

  return (
    <>
      <Header />
     

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/viewCourse" element={<ViewCourse />} />
        <Route path="/account" element={<div>Account Page</div>} />
  
        <Route path="/auth" element={<AuthApp />} />
        <Route path="about" element={<About />} />
        

        {/* {user.role === "instructor" ? ( */}
          <>
            <Route path="/courses" element={<InstructorCourse />} />
            <Route path="/dashboard/upload" element={<VideoUploadPage />} />
          </>
        {/* ) : ( */}
          <>
            {/* <Route path="/courses" element={<StudentCourse />} /> */}
            <Route path="/dashboard/upload" element={<Navigate to="/courses" />} />
          </>
        {/* )} */}

        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>

      {location.pathname === "/" && <Footer />}
    </>
  );
}

export default App;
