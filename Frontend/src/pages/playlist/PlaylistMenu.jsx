import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  useGetUserAllPlaylistQuery,
  useAddVideoToPlaylistMutation,
} from "../../redux/api/playlistApiSlice";

const PlaylistMenu = ({ userId, videoId }) => {
  const [open, setOpen] = useState(false);

  const { data: playlistsData, isLoading } = useGetUserAllPlaylistQuery(userId, {
    skip: !userId,
  });
  const [addVideoToPlaylist] = useAddVideoToPlaylistMutation();

  const playlists = playlistsData?.data?.playlists || [];
  console.log("Playlists:", playlists);
  console.log("Video ID:", videoId);
  console.log("User ID:", userId);
  // ✅ Handle add video
  const handleAddToPlaylist = async (playlistId) => {
    try {
      await addVideoToPlaylist({ playlistId, videoId }).unwrap();
      toast.success("Video added to playlist!");
      setOpen(false);
    } catch (err) {
      if (err?.data?.message?.includes("already exists")) {
        toast.info("Video already in this playlist.");
      } else {
        toast.error(err?.data?.message || "Failed to add video.");
      }
    }
  };

  return (
    <div className="relative inline-block text-left">
      {/* 3-dot button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-full hover:bg-gray-700 text-gray-300"
      >
        <MoreVertical size={20} />
      </button>

      {/* Dropdown menu → directly playlists */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-60 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
          >
            {isLoading ? (
              <p className="text-gray-400 p-3">Loading playlists...</p>
            ) : playlists.length === 0 ? (
              <p className="text-gray-400 p-3">No playlists found.</p>
            ) : (
              playlists.map((pl) => (
                <button
                  key={pl._id}
                  onClick={() => handleAddToPlaylist(pl._id)}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800"
                >
                  {pl.name}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlaylistMenu;
