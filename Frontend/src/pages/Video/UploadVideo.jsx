import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUploadVideoMutation } from "../../redux/api/videoApiSlice"; // 👈 tumhe ye mutation banana hoga

const UploadVideo = () => {
  const navigate = useNavigate();
  const [uploadVideo, { isLoading }] = useUploadVideoMutation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublished: false,
    video: null,
    thumbnail: null,
  });

  // 🔥 handle input change (for text/checkbox)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 🔥 handle file change (for video/thumbnail)
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.files[0],
    });
  };

  // 🔥 submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.video || !formData.thumbnail) {
      toast.error("All fields are required!");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("isPublished", formData.isPublished);
    data.append("video", formData.video);
    data.append("thumbnail", formData.thumbnail);

    try {
      const res = await uploadVideo(data).unwrap();
      toast.success("Video uploaded successfully 🎉");
      navigate("/"); // home page pe redirect
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error(err?.data?.message || err?.message || "Upload failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-lg space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-white">Upload Video</h2>

        {/* Title */}
        <input
          type="text"
          name="title"
          placeholder="Video Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 rounded-lg bg-gray-700 text-white outline-none"
          required
        />

        {/* Description */}
        <textarea
          name="description"
          placeholder="Video Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 rounded-lg bg-gray-700 text-white outline-none"
          rows="4"
          required
        />

        {/* Video File */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Upload Video</label>
          <input
            type="file"
            name="video"
            accept="video/*"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0 file:text-sm file:font-semibold
              file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            required
          />
        </div>

        {/* Thumbnail File */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-300">Upload Thumbnail</label>
          <input
            type="file"
            name="thumbnail"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0 file:text-sm file:font-semibold
              file:bg-green-600 file:text-white hover:file:bg-green-700"
            required
          />
        </div>

        {/* Publish Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isPublished"
            checked={formData.isPublished}
            onChange={handleChange}
          />
          <span className="text-white">Publish immediately</span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg"
        >
          {isLoading ? "Uploading..." : "Upload Video"}
        </button>
      </form>
    </div>
  );
};

export default UploadVideo;
