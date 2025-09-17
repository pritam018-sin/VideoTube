import { Link, useNavigate } from "react-router-dom";
import { BiSearch } from "react-icons/bi";
import Logo from "../../assets/vite.svg";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../../redux/api/userApiSlice";
import { logout as logoutAction } from "../../redux/feature/auth/authSlice";
import { toast } from "react-toastify";
import ProfileMenu from "../../components/ProfileMenu";
import VideoSearchPage from "../Video/VideoSearchPage";

export default function Navbar() {
  const { userInfo } = useSelector((state) => state.auth);
  const [showMenu, setShowMenu] = useState(false);
   const [searchOpen, setSearchOpen] = useState(false); 

  const [logoutApi] = useLogoutMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (err) {
      console.warn("Logout API failed (still clearing front-end):", err);
    } finally {
      dispatch(logoutAction());
      setShowMenu(false);
      toast.success("Logged out");
      navigate("/login");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
    setShowSearch(false); // input band kar do
  };
  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
      <Link to="/" className="flex items-center space-x-3 ml-20">
        <img src={Logo} alt="Logo" className="h-10" />
        <div>
          <div className="text-xl font-bold">VideoTube</div>
        </div>
      </Link>

      <div className="flex items-center space-x-4">
         <button
        onClick={() => setSearchOpen(true)}
        className="p-2 rounded hover:bg-gray-800"
      >
        <BiSearch size={22} />
      </button>

      {/* Overlay */}
      <VideoSearchPage
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
        {userInfo ? (
          <div className="relative">
            <div
              onClick={() => setShowMenu((s) => !s)}
              className="flex items-center cursor-pointer space-x-2"
            >
              <img
                src={userInfo.avatar}
                alt={userInfo.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>

            {showMenu && (
              <ProfileMenu
                userInfo={userInfo}
                onClose={() => setShowMenu(false)}
              />
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="hover:text-purple-300">
              Login
            </Link>
            <Link to="/register" className="hover:text-purple-300">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
