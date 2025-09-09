import React from "react";
import { useWatchHistoryQuery } from "../../redux/api/userApiSlice.js"; // apne slice se import

const WatchHistory = () => {
  const { data, isLoading, error } = useWatchHistoryQuery();
  console.log("Watch History Data:", data);

  if (isLoading) return <div className="text-white mt-20">Loading...</div>;
  if (error)
    return (
      <div className="text-red-500 mt-20">Error loading watch history</div>
    );

  // Agar API ka data structure { data: [...] } hai
  const history = data?.data || [];

  return (
    <div className="min-h-screen text-white px-6 py-10 mt-20 mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Watch History</h1>

      {history.length === 0 ? (
        <p className="text-gray-400">No watch history available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((video) => (
            <div
              key={video._id}
              className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:scale-[1.02] transition-transform"
            >
              {/* Thumbnail */}
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-40 object-cover"
              />

              {/* Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  {video.channelName}
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Watched on {new Date(video.watchedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchHistory;
