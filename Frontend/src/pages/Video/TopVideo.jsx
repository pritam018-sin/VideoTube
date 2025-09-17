import React from "react";
import { Link } from "react-router-dom";
import { useTopVideosQuery } from "../../redux/api/videoApiSlice";
import { format } from "timeago.js";

const TopVideo = () => {
  const { data, isLoading, error } = useTopVideosQuery();

  if (isLoading) return <p className="text-gray-400">Loading...</p>;
  if (error) return <p className="text-red-500">Error loading videos</p>;

  const videos = data?.data || [];

  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <Link
          to={`/watch/${video._id}`}
          key={video._id}
          className="flex gap-3 group"
        >
          {/* Thumbnail */}
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-40 h-24 rounded-lg object-cover flex-shrink-0 group-hover:opacity-90 transition"
          />

          {/* Video Info */}
          <div className="flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-blue-400 transition">
              {video.title}
            </h3>
            <p className="text-xs text-gray-400">
              {video.owner?.fullname || "Unknown Channel"}
            </p>
            <div className="text-xs text-gray-500">
              {video.views || 0} views •{" "}
              {format(video.createdAt)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default TopVideo;

