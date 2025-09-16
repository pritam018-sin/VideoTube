import React, { useState } from "react";
import { useCreatePlaylistMutation } from "../../redux/api/playlistApiSlice";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const CreatePlaylist = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [createPlaylist, { isLoading }] = useCreatePlaylistMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Playlist name is required");
      return;
    }

    try {
      const res = await createPlaylist({ name, description }).unwrap();
      toast.success(res?.message || "Playlist created successfully!");
      setName("");
      setDescription("");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create playlist");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-md mx-auto bg-white/10 border border-white/20 rounded-xl p-6 shadow-lg"
    >
      <h2 className="text-2xl font-bold text-white mb-4">Create Playlist</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Playlist Name */}
        <div>
          <label className="block text-gray-300 mb-1">Playlist Name</label>
          <input
            type="text"
            placeholder="Enter playlist name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Playlist Description */}
        <div>
          <label className="block text-gray-300 mb-1">Description</label>
          <textarea
            placeholder="Enter description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
        >
          {isLoading ? "Creating..." : "Create Playlist"}
        </button>
      </form>
    </motion.div>
  );
};

export default CreatePlaylist;
