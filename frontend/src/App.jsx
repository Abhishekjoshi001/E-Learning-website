import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/header/Header";
import VideoUploadPage from "./dashboard/instructorVideo";
import InstructorCourse from "./dashboard/instructorCourse";
import StudentCourse from "./dashboard/userCourses";
import ViewCourse from "./pages/viewCourse";
import HomePage from "./pages/home/homePage";
import AuthApp from "./pages/authPage";
// import { getUserFromToken } from "../utils/getUserFromToken";

function App() {
  // const user = req.user

  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthApp />} />
        <Route path="/viewCourse" element={<ViewCourse />} />
        <Route path="/account" element={<div>Account Page</div>} />
        <Route path="/about" element={<div>About Page</div>} />

        {/* {user.role === "instructor" ? ( */}
          <>
            <Route path="/courses" element={<InstructorCourse />} />
            <Route path="/dashboard/upload" element={<VideoUploadPage />} />
          </>
        {/* ) : ( */}
          <>
            <Route path="/courses" element={<StudentCourse />} />
            <Route path="/dashboard/upload" element={<Navigate to="/courses" />} />
          </>
        {/* )} */}

        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </>
  );
}

export default App;
