import React, { useState } from "react";
import {
  useGetSinglePlaylistQuery,
  useRemoveVideoFromPlaylistMutation,
} from "../../redux/api/playlistApiSlice";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {FaCross} from "react-icons/fa" // close icon

const RemoveVideoFromPlaylist = ({ playlistId, onClose }) => {
  const { data, isLoading, error } = useGetSinglePlaylistQuery(playlistId);
  const [removeVideo, { isLoading: removing }] =
    useRemoveVideoFromPlaylistMutation();
  const [selectedVideoId, setSelectedVideoId] = useState(null);
   
  const handleRemove = async () => {
    if (!selectedVideoId) {
      toast.error("Please select a video to remove!");
      return;
    }

    try {
      await removeVideo({ playlistId, videoId: selectedVideoId }).unwrap();
      toast.success("Video removed from playlist!");
      setSelectedVideoId(null);
      onClose?.();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to remove video");
    }
  };

  if (isLoading)
    return <p className="text-gray-400">Loading playlist videos...</p>;
  if (error) return <p className="text-red-500">Error loading playlist.</p>;

  const playlist = data?.data.playlist;
  const videos = playlist?.videos || [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="relative bg-gray-900 p-6 rounded-xl shadow-2xl border border-gray-700 max-w-3xl mx-auto"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-white"
      >
        <FaCross size={20} />
      </button>

      <h2 className="text-xl font-semibold text-white mb-4">
        Remove Video from "{playlist?.name}"
      </h2>

      {videos.length === 0 ? (
        <p className="text-gray-400">No videos in this playlist.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <div
              key={video._id}
              onClick={() => setSelectedVideoId(video._id)}
              className={`cursor-pointer rounded-lg overflow-hidden border transition ${
                selectedVideoId === video._id
                  ? "border-red-500"
                  : "border-gray-700 hover:border-gray-500"
              }`}
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-32 object-cover"
              />
              <p className="text-white text-sm p-2 truncate">{video.title}</p>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleRemove}
        disabled={!selectedVideoId || removing}
        className={`mt-6 w-full px-4 py-2 rounded-lg text-white font-medium transition ${
          !selectedVideoId || removing
            ? "bg-gray-700 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {removing ? "Removing..." : "Remove Selected Video"}
      </button>
    </motion.div>
  );
};

export default RemoveVideoFromPlaylist;
