import React, { useState } from "react";
import { useChangePasswordMutation } from "../../redux/api/userApiSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirm password do not match!");
      return;
    }

    try {
      setErrorMsg("");
      setSuccessMsg("");

      const res = await changePassword({ currentPassword, newPassword }).unwrap();

      // ✅ ApiResponse returns { statusCode, data, message }
      setSuccessMsg(res?.message || "Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("Password changed successfully! Redirecting...");
      setTimeout(() => navigate("/current-user"), 2000);
    } catch (err) {
      setErrorMsg(err?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>

        {errorMsg && <p className="text-red-500 mb-4">{errorMsg}</p>}
        {successMsg && <p className="text-green-500 mb-4">{successMsg}</p>}

        {/* Current Password */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500 outline-none"
            required
          />
        </div>

        {/* New Password */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500 outline-none"
            required
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500 outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {isLoading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
