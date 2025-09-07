import React from "react";
import { useGetCurrentUserQuery } from "../../redux/api/userApiSlice";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const UserProfile = () => {
  const { data, isLoading, error } = useGetCurrentUserQuery();
  const user = data?.data;
 console.log(user);
  if (isLoading)
    return <div className="text-center mt-20 text-gray-400">Loading...</div>;
  if (error)
    return (
      <div className="text-red-500 text-center mt-20">Error loading profile</div>
    );

  return (
    <div className="bg-[#0f0f0f] min-h-screen text-white font-sans mt-15">
      {/* Banner */}
      <div className="relative w-full h-60 bg-gradient-to-r from-[#1a1a1a] to-[#111111] overflow-hidden">
        {user?.coverImage ? (
          <img
            src={user.coverImage}
            alt="Cover"
            className="w-full h-60 object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-60 bg-gradient-to-r from-gray-800 to-gray-900" />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />
      </div>

      {/* Profile Section */}
      <div className="relative max-w-6xl mx-auto px-6">
        {/* Avatar */}
        <motion.img
          whileHover={{ scale: 1.1 }}
          src={user?.avatar || "https://via.placeholder.com/150"}
          alt="Avatar"
          className="absolute -top-20 left-6 w-50 h-50 rounded-full border-4 border-[#0f0f0f] shadow-[0_0_20px_rgba(255,255,255,0.2)] object-cover"
        />

        {/* User Info */}
        <div className="pt-30 pl-12 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-wide">{user?.fullname}</h1>
            <p className="text-red-400 text-lg mt-1">@{user?.username}</p>
            <p className="text-gray-300 mt-2">Email: {user?.email}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6 md:mt-0">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px #ff0000" }}
              className="px-7 py-2 rounded-full bg-gradient-to-r from-red-600 to-pink-500 text-white font-semibold hover:brightness-110 transition-all"
            >
              <Link to="/update-account-details">Edit Profile</Link>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px #ffffff50" }}
              className="px-7 py-2 rounded-full bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-all"
            >
              <Link to="/change-password">Change Password</Link>
            </motion.button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10 border-b border-gray-700 flex gap-8 text-gray-400">
          <button className="pb-3 border-b-2 border-red-500 text-white font-medium">
            <Link to="/current-user">Profile</Link>
          </button>
          <button className="pb-3 hover:text-white font-medium">
            <Link to="/user/settings">Settings</Link>
          </button>
          <button className="pb-3 hover:text-white font-medium">
            <Link to="/user/activity">Activity</Link>
          </button>
        </div>

        {/* Stats Section */}
        <div className="mt-8 flex gap-6 text-gray-300">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold">{user?.subscribersCount || 0}</span>
            <span className="text-gray-500">Subscribers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold">{user?.subscribedToCount || 0}</span>
            <span className="text-gray-500">Subscribed To</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold">{user?.videosCount || 0}</span>
            <span className="text-gray-500">Videos</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold">{user?.likesCount || 0}</span>
            <span className="text-gray-500">Likes</span>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
