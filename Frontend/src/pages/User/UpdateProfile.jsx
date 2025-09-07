import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  useGetCurrentUserQuery,
  useUpdateAccountDetailsMutation,
} from "../../redux/api/userApiSlice.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const UpdateProfile = () => {
  const { data, isLoading } = useGetCurrentUserQuery();
  const [updateAccountDetails, { isLoading: isUpdating }] =
    useUpdateAccountDetailsMutation();
    const navigate = useNavigate();
  const user = data?.data;

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    username: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || "",
        email: user.email || "",
        username: user.username || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Send formData directly
      await updateAccountDetails(formData).unwrap();
      navigate("/current-user");
      toast.success("Profile updated successfully ✅");
    } catch (error) {
      console.error(error);
      toast.error("Update failed ❌");
    }
  };

  if (isLoading) {
    return <p className="text-gray-400 text-center mt-20">Loading...</p>;
  }

  return (
    <div className=" min-h-screen text-white px-6 py-10 mt-20">
      <div className="max-w-2xl mx-auto bg-[#1a1a1a] rounded-2xl p-8 shadow-lg border border-gray-800">
        <h1 className="text-3xl font-bold mb-6">Update Profile</h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Fullname */}
          <div>
            <label className="block text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-[#0f0f0f] border border-gray-700 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-[#0f0f0f] border border-gray-700 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-gray-300 mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-[#0f0f0f] border border-gray-700 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            disabled={isUpdating}
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-red-600 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Save Changes"}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;

