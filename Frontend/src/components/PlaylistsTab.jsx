import React from "react";
import { useGetUserAllPlaylistQuery } from "../redux/api/playlistApiSlice";
import { MdPlaylistPlay } from "react-icons/md"; // modern playlist icon
import { Link } from "react-router-dom";

const PlaylistsTab = ({ userId }) => {
  const { data, isLoading, error } = useGetUserAllPlaylistQuery(userId);

  const playlistData = data?.data?.playlists || [];

  if (isLoading) return <div className="text-center py-10 text-gray-400">Loading playlists...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error loading playlists</div>;
  if (playlistData.length === 0) return <div className="text-center py-10 text-gray-400">No playlists found</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {playlistData.map((playlist) => (
        <Link to={`/playlist/${playlist._id}`} key={playlist._id}>
        <div
          key={playlist._id}
          className="rounded-2xl p-6 backdrop-blur-lg bg-white/5 border border-white/10 shadow-md 
                     transition-transform transform hover:scale-105 hover:shadow-xl cursor-pointer"
        >
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <MdPlaylistPlay className="text-indigo-400 text-2xl" /> 
            {playlist.name}
          </h3>
          {playlist.description && (
            <p className="text-sm text-gray-300 line-clamp-2">{playlist.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-3">
            {playlist.videos?.length || 0} videos
          </p>
        </div>
        </Link>
      ))}
    </div>
  );
};

export default PlaylistsTab;
