import React from "react";
import { useGetUserVideosQuery } from "../redux/api/videoApiSlice";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { format } from "timeago.js";
import { formatDuration } from "../utils/formatDuration.js";

const VideosTab = ({ userId, onAdd }) => {
  const { data, isLoading, error } = useGetUserVideosQuery(userId || "");

  if (isLoading) {
    return <p className="text-gray-400">Loading videos...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error loading videos.</p>;
  }

  const videos = data?.data || [];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
      {videos.length === 0 ? (
        <p className="text-gray-400">No videos uploaded yet.</p>
      ) : (
        videos.map((video, index) => (
          <motion.div
            key={video._id || index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="rounded-lg overflow-hidden bg-white/5 border border-white/10 shadow-lg"
          >
            {/* Thumbnail */}
            <Link to={`/watch/${video._id}`}>
              <div className="relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover border-b border-gray-700 rounded-t-lg"
                />
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </span>
              </div>
            </Link>

            {/* Info */}
            <div className="p-3 flex gap-3 items-start">
              {/* Owner Avatar */}
              <Link to={`/user-channel/${video.owner?.username || ""}`}>
                <img
                  src={video.owner?.avatar}
                  alt={video.owner?.fullname || "Owner"}
                  className="w-10 h-10 rounded-full"
                />
              </Link>

              <div className="flex-1 flex flex-col">
                {/* Title */}
                <Link to={`/watch/${video._id}`}>
                  <h2 className="text-lg font-semibold text-white line-clamp-2 hover:text-red-500 transition">
                    {video.title}
                  </h2>
                </Link>

                {/* Owner name */}
                <Link
                  to={`/user-channel/${video.owner?.username || ""}`}
                  className="text-sm text-white/50 hover:text-red-500 transition"
                >
                  {video.owner?.fullname}
                </Link>

                {/* Views + Date */}
                <p className="text-sm text-white/50 mt-1">
                  {video.views} views · {format(video.createdAt)}
                </p>
              </div>
            </div>

            {/* ✅ Add Button (sirf tab dikhana jab onAdd prop mile) */}
            {onAdd && (
              <div className="px-3 pb-3">
                <button
                  onClick={() => onAdd(video._id)}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                >
                  ➕ Add to Playlist
                </button>
              </div>
            )}
          </motion.div>
        ))
      )}
    </div>
  );
};

export default VideosTab;
