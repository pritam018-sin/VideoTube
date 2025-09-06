import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../../redux/api/userApiSlice";

const Register = () => {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: null,
    coverImage: null,
  });

  // 🔥 handle input change (for text)
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🔥 handle file change (for avatar/cover)
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.files[0],
    });
  };

  // 🔥 submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("username", formData.username);
    data.append("email", formData.email);
    data.append("password", formData.password);
    if (formData.avatar) data.append("avatar", formData.avatar);
    if (formData.coverImage) data.append("coverImage", formData.coverImage);

    try {
      await register(data).unwrap();
      navigate("/login");
    } catch (err) {
      console.error("Register failed:", err);
      alert(err?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-white">Register</h2>

        {/* Full Name */}
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full p-2 rounded-lg bg-gray-700 text-white outline-none"
          required
        />

        {/* Username */}
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="w-full p-2 rounded-lg bg-gray-700 text-white outline-none"
          required
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 rounded-lg bg-gray-700 text-white outline-none"
          required
        />

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 rounded-lg bg-gray-700 text-white outline-none"
          required
        />

        {/* Confirm Password */}
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full p-2 rounded-lg bg-gray-700 text-white outline-none"
          required
        />

        {/* Avatar Upload */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Upload Avatar</label>
          <input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0 file:text-sm file:font-semibold
              file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
        </div>

        {/* Cover Image Upload */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Upload Cover Image</label>
          <input
            type="file"
            name="coverImage"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0 file:text-sm file:font-semibold
              file:bg-green-600 file:text-white hover:file:bg-green-700"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg"
        >
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
