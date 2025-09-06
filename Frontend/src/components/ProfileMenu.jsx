import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLogoutMutation } from "../redux/api/userApiSlice";
import { logout } from "../redux/feature/auth/authSlice";
import { toast } from "react-toastify";

export default function ProfileMenu({ userInfo, onClose }) {
  const dispatch = useDispatch();
  const [logoutApiCall] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      toast.success("Logout successful");
      onClose?.();
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="absolute right-0 top-12 w-56 bg-gray-900 border border-white/10 rounded-2xl shadow-xl z-50 backdrop-blur-lg">
      <div className="px-4 py-3 border-b border-white/10">
        <p className="font-semibold text-white flex flex-col">{userInfo?.fullname}
        <span className="font-normal text-gray-400 ml-1">{userInfo.username}</span></p>
        
      </div>

      <div className="flex flex-col py-2">
        <Link
          to="/profile"
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-200 hover:bg-white/10 transition rounded-md"
        >
          My Profile
        </Link>
        <Link
          to="/upload"
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-200 hover:bg-white/10 transition rounded-md"
        >
          Upload Video
        </Link>
        <Link
          to="/subscriptions"
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-200 hover:bg-white/10 transition rounded-md"
        >
          My Subscriptions
        </Link>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 text-left transition rounded-md"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
