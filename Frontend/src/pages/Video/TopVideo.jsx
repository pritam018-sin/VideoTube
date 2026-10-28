import React from "react";
import { Link } from "react-router-dom";
import { useTopVideosQuery } from "../../redux/api/videoApiSlice";
import { format } from "timeago.js";
import { ensureHttps } from "../../utils/url.js";
import { formatDuration } from "../../utils/formatDuration.js";

const TopVideo = () => {
  const { data, isLoading, error } = useTopVideosQuery();

  if (isLoading) return <p className="text-gray-400 py-4 text-sm">Loading suggestions...</p>;
  if (error) return <p className="text-red-400 py-4 text-sm">Unable to load suggestions</p>;

  const videos = data?.data || [];

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-white mb-3">Top Recommended</h3>
      {videos.map((video) => (
        <Link
          to={`/watch/${video._id}`}
          key={video._id}
          className="flex gap-3 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition group"
        >
          {/* Thumbnail */}
          <div className="relative w-36 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-black/50">
            <img
              src={ensureHttps(video.thumbnail)}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            {video.duration ? (
              <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                {formatDuration(video.duration)}
              </span>
            ) : null}
          </div>

          {/* Video Info */}
          <div className="flex flex-col justify-between py-0.5 min-w-0">
            <h4 className="text-xs font-semibold text-white line-clamp-2 group-hover:text-red-400 transition leading-snug">
              {video.title}
            </h4>
            <div className="mt-1">
              <p className="text-[11px] text-gray-400 truncate">
                {video.owner?.fullname || video.owner?.username || "Channel"}
              </p>
              <p className="text-[10px] text-gray-500">
                {video.views || 0} views · {format(video.createdAt)}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default TopVideo;

