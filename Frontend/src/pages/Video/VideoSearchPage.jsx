import React, { useState } from "react";
import { useSearchVideosQuery } from "../../redux/api/videoApiSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { format } from "timeago.js";

const VideoSearchPage = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");

  const { data, isLoading, error } = useSearchVideosQuery(query, {
    skip: !query,
  });

  const videos = data?.data || data || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col max-w-7xl mx-auto overflow-hidden ml-14"
        >
          {/* Header with search input */}
          <div className="p-4 bg-gray-900 flex items-center gap-3 border-b border-gray-800">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search videos..."
              autoFocus
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-300"
            >
              <X size={22} />
            </button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {isLoading && <p className="text-gray-400">Loading...</p>}
            {error && (
              <p className="text-red-500">Error fetching videos</p>
            )}
            {!isLoading && query && videos.length === 0 && (
              <p className="text-gray-400">No videos found.</p>
            )}

            {videos.map((video) => (
              <motion.div
                key={video._id}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col md:flex-row gap-4 bg-white/5 rounded-xl border border-gray-800 hover:border-gray-600 shadow-md overflow-hidden"
              >
                {/* Thumbnail */}
                <Link
                  to={`/watch/${video._id}`}
                  onClick={onClose} // close overlay when video clicked
                  className="md:w-2/5"
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-120 h-60 object-cover rounded-lg md:rounded-l-xl md:rounded-r-none"
                  />
                </Link>

                {/* Video Info */}
                <div className="flex flex-col justify-between p-4 md:w-3/5">
                  <Link
                    to={`/watch/${video._id}`}
                    onClick={onClose}
                  >
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-400 transition">
                      {video.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-400 mb-2">
                    {video.owner?.fullname || "Unknown Channel"}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {video.description || "No description available."}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                    <span>{video.views || 0} views</span>
                    <span>•</span>
                    <span>{format(video.createdAt)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoSearchPage;
