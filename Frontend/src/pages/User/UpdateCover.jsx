import React from 'react'
import { useState } from 'react';
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useGetCurrentUserQuery } from "../../redux/api/userApiSlice";
import { useNavigate } from "react-router-dom";
import { useUpdateCoverMutation } from "../../redux/api/userApiSlice";


const UpdateCover = () => {
  const [file, setFile] = useState(null);
  const [updateCover, { isLoading }] = useUpdateCoverMutation();
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
    formData.append("cover", file);

    try {
      await updateCover(formData).unwrap();
      navigate("/current-user");
      toast.success("Cover photo updated successfully!");
      setFile(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update cover photo.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-center">Update Cover Photo</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div>
          <label className="block text-gray-300 mb-2">Choose Cover Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-gray-400 bg-amber-300/10 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Preview */}
        {file ? (
            <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-32 object-cover rounded border border-gray-700" />
          ) : (
            <img src={user?.coverImage} alt="User Cover" className="w-full h-32 object-cover rounded border border-gray-700" />
          )}

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          disabled={isLoading}
          type="submit"
          className="w-full py-3 rounded-lg bg-gradient-to-r from-red-600 to-pink-500 text-white font-semibold hover:brightness-110 transition-all disabled:opacity-50"
        >
          {isLoading ? "Updating..." : "Update Cover Photo"}
        </motion.button>
      </form>
    </div>
  )
}

export default UpdateCover
