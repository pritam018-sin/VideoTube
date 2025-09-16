import React, { useState } from "react";
import {
  useGetUserAllPlaylistQuery,
  useDeletePlaylistMutation,
  useUpdatePlaylistMutation,
  useAddVideoToPlaylistMutation,
  useRemoveVideoFromPlaylistMutation,
} from "../../redux/api/playlistApiSlice";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import VideosTab from "../../components/VideosTab";
import RemoveVideoFromPlaylist from "./RemoveVideoFromPlaylis";


const ManagePlaylist = ({ userId }) => {
  const { data, isLoading, error, refetch } =
    useGetUserAllPlaylistQuery(userId);

  const [deletePlaylist] = useDeletePlaylistMutation();
  const [updatePlaylist] = useUpdatePlaylistMutation();
  const [addVideoToPlaylist] = useAddVideoToPlaylistMutation();
  const [removeVideoFromPlaylist] = useRemoveVideoFromPlaylistMutation();

  const playlists = data?.data?.playlists || [];

  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedDescription, setUpdatedDescription] = useState("");

  // Modal state
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const handleDelete = async (playlistId) => {
    try {
      await deletePlaylist(playlistId).unwrap();
      toast.success("Playlist deleted successfully!");
      refetch();
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error(err?.data?.message || "Failed to delete playlist");
    }
  };

  const handleEdit = (playlist) => {
    setEditingPlaylist(playlist._id);
    setUpdatedName(playlist.name);
    setUpdatedDescription(playlist.description || "");
  };

  const handleUpdate = async (id) => {
    try {
      await updatePlaylist({
        playlistId: id,
        name: updatedName,
        description: updatedDescription,
      }).unwrap();
      toast.success("Playlist updated!");
      setEditingPlaylist(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  const handleAddVideo = async (videoId) => {
    try {
      await addVideoToPlaylist({
        playlistId: selectedPlaylist,
        videoId,
      }).unwrap();
      toast.success("Video added to playlist!");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add video");
    }
  };

  const handleRemoveVideo = async (videoId) => {
    try {
      await removeVideoFromPlaylist({
        playlistId: selectedPlaylist,
        videoId,
      }).unwrap();
      toast.success("Video removed from playlist!");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to remove video");
    }
  };

  if (isLoading) return <p className="text-gray-400">Loading playlists...</p>;
  if (error) return <p className="text-red-500">Error fetching playlists</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-white">Manage Your Playlists</h2>

      {playlists?.length === 0 && (
        <p className="text-gray-400">No playlists found. Create one first.</p>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {playlists?.map((playlist) => (
          <motion.div
            key={playlist._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 border border-white/20 rounded-xl p-4 shadow-md"
          >
            {editingPlaylist === playlist._id ? (
              <div className="space-y-3">
                <input
                  value={updatedName}
                  onChange={(e) => setUpdatedName(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-black/40 border border-gray-600 text-white"
                />
                <textarea
                  value={updatedDescription}
                  onChange={(e) => setUpdatedDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-black/40 border border-gray-600 text-white"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdate(playlist._id)}
                    className="bg-green-600 px-3 py-1 rounded text-white hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingPlaylist(null)}
                    className="bg-gray-600 px-3 py-1 rounded text-white hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-white">
                  {playlist.name}
                </h3>
                <p className="text-gray-400 text-sm">
                  {playlist.description || "No description"}
                </p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <button
                    onClick={() => handleEdit(playlist)}
                    className="bg-blue-600 px-3 py-1 rounded text-white hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(playlist._id)}
                    className="bg-red-600 px-3 py-1 rounded text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPlaylist(playlist._id);
                      setShowAddModal(true);
                    }}
                    className="bg-purple-600 px-3 py-1 rounded text-white hover:bg-purple-700"
                  >
                    + Add Video
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPlaylist(playlist._id);
                      setShowRemoveModal(true);
                    }}
                    className="bg-yellow-600 px-3 py-1 rounded text-white hover:bg-yellow-700"
                  >
                    - Remove Video
                  </button>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Modal for Adding Video */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-white/10 border border-white/20 rounded-xl p-6 w-[700px] max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              Select videos to add
            </h3>

            <VideosTab userId={userId} onAdd={(videoId) => handleAddVideo(videoId)} />

            <button
              onClick={() => setShowAddModal(false)}
              className="mt-4 bg-gray-600 px-4 py-2 rounded text-white hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal for Removing Video */}
      {showRemoveModal && (
        <RemoveVideoFromPlaylist
          playlistId={selectedPlaylist}
          onClose={() => setShowRemoveModal(false)}
          onRemove={handleRemoveVideo}
        />
      )}
    </motion.div>
  );
};


export default ManagePlaylist;
