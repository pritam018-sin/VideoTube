import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useGetCurrentUserQuery } from "../../redux/api/userApiSlice";
import { useNavigate } from "react-router-dom";
import { useUpdateAvatarMutation } from "../../redux/api/userApiSlice"; // ✅ apna slice import karo

const UpdateAvatar = () => {
  const [file, setFile] = useState(null);
  const [updateAvatar, { isLoading }] = useUpdateAvatarMutation();
  const { data } = useGetCurrentUserQuery();
  const navigate = useNavigate();
  const user = data?.data;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file!");

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      await updateAvatar(formData).unwrap();
        navigate("/current-user");
      toast.success("Avatar updated successfully!");
      setFile(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update avatar.");
    }
  };

  return (
    <div className="min-h-screen text-white flex justify-center items-center px-6">
      <div className="max-w-md w-full bg-[#1a1a1a]/20 p-8 rounded-2xl shadow-lg border border-gray-800">
        <h1 className="text-2xl font-bold mb-6 text-center">Update Avatar</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-gray-300 mb-2">Choose Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-gray-400 bg-amber-300/10 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Preview */}
          {file ? (
              <img src={URL.createObjectURL(file)} alt="Preview" className="w-32 h-32 object-cover rounded-full border border-gray-700" />
            ) : (
              <img src={user?.avatar} alt="User Avatar" className="w-32 h-32 object-cover rounded-full border border-gray-700" />
            )}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            disabled={isLoading}
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-red-600 to-pink-500 text-white font-semibold hover:brightness-110 transition-all disabled:opacity-50"
          >
            {isLoading ? "Updating..." : "Update Avatar"}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default UpdateAvatar;

