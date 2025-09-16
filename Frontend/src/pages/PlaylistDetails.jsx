import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetSinglePlaylistQuery } from "../redux/api/playlistApiSlice";
import { formatDuration } from "../utils/formatDuration.js";
import { format } from "timeago.js";

const PlaylistDetails = () => {
  const { playlistId } = useParams();
  const { data, isLoading, error } = useGetSinglePlaylistQuery(playlistId);

  const playlist = data?.data?.playlist;

  if (isLoading) return <div className="text-center py-10 text-gray-400">Loading playlist...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error loading playlist</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto mt-12">
      {/* Playlist Info */}
      <h1 className="text-2xl font-bold text-white ">{playlist?.name}</h1>
      <p className="text-sm text-gray-400 mb-2">{format(playlist.createdAt)} Created</p>
      <p className="text-gray-400 mb-4">{playlist?.description}</p>

      {/* Owner Info */}
      {playlist?.owner && (
        <div className="flex items-center gap-3 mb-6">
          <Link to={`/user-channel/${playlist.owner.username}`}>
            <img
              src={playlist.owner.avatar}
              alt={playlist.owner.username}
              className="w-10 h-10 rounded-full"
            />
          </Link>
          <Link to={`/user-channel/${playlist.owner.username}`}>
            <div className="flex flex-col cursor-pointer group">
              <p className="text-white group-hover:underline">{playlist.owner.fullname}</p>
              <p className="text-sm text-gray-400">{playlist.owner.username}</p>
            </div>
          </Link>
        </div>
      )}

      {/* Videos */}
      <h2 className="text-xl font-semibold text-white">Videos</h2>
       <p className="text-sm text-gray-400 mb-4">{playlist?.videos?.length} videos</p>
      <div className="flex flex-col gap-4">
        {playlist?.videos?.length > 0 ? (
          playlist.videos.map((video) => (
            <Link
              to={`/watch/${video._id}`}
              key={video._id}
              className="flex gap-4 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition"
            >
              {/* Thumbnail with duration */}
              <div className="relative w-52 flex-shrink-0">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-28 object-cover rounded-md"
                />
                <span className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                  {formatDuration(video.duration)}
                </span>
              </div>

              {/* Video info */}
              <div className="flex flex-col justify-start">
                <h3 className="text-white font-medium line-clamp-2">{video.title}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {video.description?.length > 120
                    ? video.description.slice(0, 120) + "..."
                    : video.description}
                </p>
                <p className="text-sm text-gray-400 mt-1">{video.views} views . <span>{format(video.createdAt)}</span></p>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-400">No videos in this playlist</p>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetails;

