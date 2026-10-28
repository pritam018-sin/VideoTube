import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUploadVideoMutation } from "../../redux/api/videoApiSlice";
import { useSelector } from "react-redux";
import { Upload, Video, Image, CheckCircle, ArrowLeft } from "lucide-react";

const UploadVideo = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [uploadVideo, { isLoading }] = useUploadVideoMutation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublished: true, // Default to true so videos are visible right away
    video: null,
    thumbnail: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInfo) {
      toast.error("Please login to upload videos");
      navigate("/login");
      return;
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.video || !formData.thumbnail) {
      toast.error("All fields (title, description, video, thumbnail) are required!");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title.trim());
    data.append("description", formData.description.trim());
    data.append("isPublished", formData.isPublished);
    data.append("video", formData.video);
    data.append("thumbnail", formData.thumbnail);

    try {
      await uploadVideo(data).unwrap();
      toast.success("Video uploaded successfully 🎉");
      navigate("/");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error(err?.data?.message || err?.message || "Upload failed. Please check file format and try again.");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-xl bg-gradient-to-b from-gray-900/90 to-gray-950/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Upload className="w-6 h-6 text-red-500" />
            Upload Video
          </h2>
          <div className="w-12" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Video Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="Give your video a catchy title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Tell viewers what your video is about"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition resize-none"
              rows="4"
              required
            />
          </div>

          {/* Video File */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Video File
            </label>
            <div className="relative border-2 border-dashed border-white/15 hover:border-red-500/50 rounded-2xl p-4 transition bg-white/[0.02]">
              <input
                type="file"
                name="video"
                accept="video/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
                  <Video className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {formData.video ? formData.video.name : "Select video file (MP4, MKV, MOV)"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formData.video ? `${(formData.video.size / (1024 * 1024)).toFixed(1)} MB` : "Click or drag & drop to choose"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnail File */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Thumbnail Image
            </label>
            <div className="relative border-2 border-dashed border-white/15 hover:border-blue-500/50 rounded-2xl p-4 transition bg-white/[0.02]">
              <input
                type="file"
                name="thumbnail"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                  <Image className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {formData.thumbnail ? formData.thumbnail.name : "Select thumbnail image (JPG, PNG, WebP)"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formData.thumbnail ? `${(formData.thumbnail.size / 1024).toFixed(1)} KB` : "Click or drag & drop to choose"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div>
              <p className="text-sm font-medium text-white">Publish Immediately</p>
              <p className="text-xs text-gray-400">Make this video visible to everyone right away</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-red-600/30 transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Uploading Video to Cloudinary...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Upload Video</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadVideo;

