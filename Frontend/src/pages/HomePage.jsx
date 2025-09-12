import React from "react";
import { useGetAllVideosQuery } from "../redux/api/videoApiSlice";
import { Link } from "react-router-dom";
import { format } from "timeago.js";

const HomePage = () => {
  const { data, isLoading, error } = useGetAllVideosQuery();
  const videos = data?.data || [];

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading videos</p>;

  return (
    <div className="grid grid-cols-3 gap-10 ml-15 mt-15 max-w-7xl mx-auto">
      {videos?.map((video) => (
        <div key={video._id} className="w-[400px]">
          {/* Thumbnail */}
          <Link to={`/watch/${video._id}`}>
            <div className="relative">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-60 object-cover border border-gray-700 rounded-lg shadow-lg"
              />
              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {video.duration || "00:00"}
              </span>
            </div>
          </Link>

          {/* Info Section */}
          <div className="mt-3 flex gap-3">
            {/* Avatar */}
            <Link to={`/user-channel/${video.owner?.username}`}>
              <img
                src={video.owner.avatar}
                alt="video owner avatar"
                className="w-10 h-10 rounded-full"
              />
            </Link>

            <div className="flex flex-col">
              {/* Title */}
              <Link to={`/watch/${video._id}`}>
                <h3 className="text-lg font-medium text-white line-clamp-1 hover:text-red-500 transition-colors">
                  {video.title}
                </h3>
              </Link>

              {/* Owner name */}
              <Link
                to={`/user-channel/${video.owner?.username}`}
                className="text-sm text-white/50 hover:text-red-500 transition-colors"
              >
                {video.owner.fullname}
              </Link>

              {/* Views + Date */}
              <p className="text-sm text-white/50">
                {video.views} views · {format(video.createdAt)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomePage;
