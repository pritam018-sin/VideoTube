import React from "react";
import { useGetAllVideosQuery } from "../redux/api/videoApiSlice";
import { Link } from "react-router-dom";
import { format } from "timeago.js";
import { formatDuration } from "../utils/formatDuration.js";
import { ensureHttps } from "../utils/url.js";

const HomePage = () => {
  const { data, isLoading, error } = useGetAllVideosQuery();
  const videos = data?.data || [];

  if (isLoading)
    return (
      <div className="min-h-screen pt-28 text-center text-gray-400">
        Loading videos...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen pt-28 text-center text-red-500">
        Failed to load videos.
      </div>
    );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos?.map((video) => (
          <div
            key={video._id}
            className="group flex flex-col rounded-2xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 transition-all duration-300 shadow-md hover:shadow-xl"
          >
            {/* Thumbnail */}
            <Link to={`/watch/${video._id}`}>
              <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                <img
                  src={ensureHttps(video.thumbnail)}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {video.duration ? (
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {formatDuration(video.duration)}
                  </span>
                ) : null}
              </div>
            </Link>

            {/* Info Section */}
            <div className="p-4 flex gap-3">
              {/* Avatar */}
              <Link
                to={`/user-channel/${video.owner?.username}`}
                className="flex-shrink-0"
              >
                <img
                  src={
                    ensureHttps(video.owner?.avatar) ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                  }
                  alt={video.owner?.username || "Owner"}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10 group-hover:ring-red-500 transition duration-300"
                />
              </Link>

              <div className="flex flex-col min-w-0 flex-1">
                {/* Title */}
                <Link to={`/watch/${video._id}`}>
                  <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-red-400 transition-colors leading-snug">
                    {video.title}
                  </h3>
                </Link>

                {/* Owner name */}
                <Link
                  to={`/user-channel/${video.owner?.username}`}
                  className="text-xs text-gray-400 hover:text-white transition-colors mt-1.5 truncate"
                >
                  {video.owner?.fullname || video.owner?.username}
                </Link>

                {/* Views + Date */}
                <p className="text-xs text-gray-500 mt-0.5">
                  {video.views || 0} views · {format(video.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
