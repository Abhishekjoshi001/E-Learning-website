import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
// import { useAuth } from "../../context/auth.jsx";

const Header = () => {
  // const [auth, setAuth] = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/logout",
        {},
        { withCredentials: true }
      );

      if (response?.data?.success) {
        toast.success(response.data.message || "Logged out successfully");
        // setAuth({ user: null, token: "" });
        localStorage.removeItem("auth");
        navigate("/");
      } else {
        toast.error(response?.data?.error || "Logout failed");
      }
    } catch (error) {
      toast.error("An error occurred during logout");
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <header className="fixed top-1 left-0 right-0 bg-white shadow-md z-50 p-3">
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        <button
          onClick={() => handleNavigate("/")}
          className="text-2xl font-bold cursor-pointer"
        >
          E-Learning
        </button>

        <ul className="flex space-x-6">
          <li>
            <button
              onClick={() => handleNavigate("/")}
              className="border border-black border-solid hover:bg-gray-600 hover:text-white bg-gray-300 px-3 py-1 rounded-lg"
            >
              Home
            </button>
          </li>
          <li>
            <button
              onClick={() => handleNavigate("/courses")}
              className="border border-black border-solid hover:bg-gray-600 hover:text-white bg-gray-300 px-3 py-1 rounded-lg"
            >
              Courses
            </button>
          </li>
          <li>
            <button
              onClick={() => handleNavigate("/about")}
              className="border border-black border-solid hover:bg-gray-600 hover:text-white bg-gray-300 px-3 py-1 rounded-lg"
            >
              About
            </button>
          </li>

          {/* {auth?.user ? ( */}
            <>
              <li>
                <button
                  onClick={() => handleNavigate("/account")}
                  className="border border-black border-solid hover:bg-gray-600 hover:text-white bg-gray-300 px-3 py-1 rounded-lg"
                >
                  Account
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </li>
            </>
          {/* ) : ( */}
            <li>
              <button
                onClick={() => handleNavigate("/auth")}
                className="border border-black border-solid hover:bg-gray-600 hover:text-white bg-gray-300 px-3 py-1 rounded-lg"
              >
                Login
              </button>
            </li>
          {/* )} */}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
