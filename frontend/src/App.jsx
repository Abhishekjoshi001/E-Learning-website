import Header from "./components/header/Header";
import VideoUploadPage from "./dashboard/instructorVideo";
import { Route,Routes } from "react-router-dom";

function App  () {
  return (
   <>
    <Routes>
      <Route path="/" element={<Header />} />
      <Route path="/upload" element={<VideoUploadPage />} />
    </Routes>
   </>
  );
};

export default App;