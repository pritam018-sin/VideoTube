import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FaList, FaPlus, FaCog } from "react-icons/fa";
import PlaylistsTab from "../components/PlaylistsTab";
import CreatePlaylist from "./playlist/CreatePlaylist";
import ManagePlaylist from "./playlist/ManagePlaylist";

const PlaylistSection = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("available"); // default tab

  return (
    <div className="max-w-6xl mx-auto mt-16 p-6">
      {/* Heading */}
      <h1 className="text-3xl font-bold text-white mb-8 text-center">
        {userInfo?.fullname} • Your Playlists
      </h1>

      {/* Tabs */}
      <div className="flex justify-center gap-6 mb-10">
        {/* Available Playlists */}
        <button
          onClick={() => setActiveTab("available")}
          className={`flex items-center gap-2 px-6 py-2 rounded-full border transition ${
            activeTab === "available"
              ? "bg-blue-600 text-white border-blue-500"
              : "bg-transparent text-gray-300 border-gray-500 hover:bg-gray-800"
          }`}
        >
          <FaList /> Available
        </button>

        {/* Create Playlist */}
        <button
          onClick={() => setActiveTab("create")}
          className={`flex items-center gap-2 px-6 py-2 rounded-full border transition ${
            activeTab === "create"
              ? "bg-green-600 text-white border-green-500"
              : "bg-transparent text-gray-300 border-gray-500 hover:bg-gray-800"
          }`}
        >
          <FaPlus /> Create
        </button>

        {/* Manage Playlist */}
        <button
          onClick={() => setActiveTab("manage")}
          className={`flex items-center gap-2 px-6 py-2 rounded-full border transition ${
            activeTab === "manage"
              ? "bg-purple-600 text-white border-purple-500"
              : "bg-transparent text-gray-300 border-gray-500 hover:bg-gray-800"
          }`}
        >
          <FaCog /> Manage
        </button>
      </div>

      {/* Content Section */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.3 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg"
      >
        {activeTab === "available" && (
          <PlaylistsTab userId={userInfo?._id} />
        )}

        {activeTab === "create" && (
          <div className="text-center text-gray-300">
            <h2 className="text-xl font-semibold text-white mb-4">Create a New Playlist</h2>
            <CreatePlaylist />
          </div>
        )}

        {activeTab === "manage" && (
          <div className="text-center text-gray-300">
            <ManagePlaylist userId={userInfo?._id} />      
            </div>
        )}
      </motion.div>
    </div>
  );
};

export default PlaylistSection;
