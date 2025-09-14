import React from "react";
import { useWatchHistoryQuery } from "../../redux/api/userApiSlice.js"; 
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { format } from "timeago.js";

const WatchHistory = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data, isLoading, error } = useWatchHistoryQuery();

  console.log("Watch History Data:", data);

  if (isLoading) return <div className="text-white mt-20">Loading...</div>;
  if (error) return <div className="text-red-500 mt-20">Error loading watch history</div>;

  // Safe response handling
  const history = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

  return (
    <div className="min-h-screen text-white px-6 py-10 mt-20 mx-auto max-w-6xl">
      {/* Page Title */}
      <h1 className="text-3xl font-extrabold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-purple-500">
        Your Watch History
      </h1>

      {history.length === 0 ? (
        <p className="text-gray-400 text-lg">No watch history available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {history.map((video) => (
            <Link
              to={`/watch/${video._id}`}
              key={video._id}
              className="group relative bg-gradient-to-br from-gray-900/70 to-gray-800/50 backdrop-blur-xl 
                         rounded-2xl shadow-xl overflow-hidden transition-transform transform hover:scale-[1.03] 
                         hover:shadow-[0_0_25px_rgba(255,0,100,0.5)]"
            >
              {/* Thumbnail */}
              <div className="relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover rounded-t-2xl group-hover:brightness-110 transition duration-300"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition duration-300"></div>
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                  <div className="bg-red-500 text-white rounded-full p-3 shadow-lg">
                    ▶
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-red-400 transition">
                  {video.title}
                </h3>

                <div className="flex items-center gap-3 mt-3">
                  {/* Avatar */}
                  <img
                    src={video.owner?.avatar}
                    alt={video.owner?.fullname || video.owner?.username}
                    className="w-9 h-9 rounded-full border border-gray-600 group-hover:scale-110 transition"
                  />
                  <div>
                    <p className="text-sm text-gray-300 font-medium">
                      {video.owner?.fullname || video.owner?.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      Uploaded {format(video.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchHistory;
