import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { BASE_URL, VIDEOS_URL } from "../../redux/constants";
import { apiSlice } from "../../redux/api/apiSlice";
import {
  Upload,
  Video,
  Image,
  CheckCircle,
  ArrowLeft,
  XCircle,
  Loader2,
  Sparkles,
  Clock,
  HardDrive
} from "lucide-react";

const UploadVideo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo, accessToken } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublished: true,
    video: null,
    thumbnail: null,
  });

  // Upload Progress & Stage State
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("idle"); // "idle" | "uploading" | "processing" | "success" | "error"
  const [uploadedMB, setUploadedMB] = useState(0);
  const [totalMB, setTotalMB] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState("");
  const abortControllerRef = useRef(null);

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

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsUploading(false);
      setProgress(0);
      setUploadStage("idle");
      toast.info("Video upload cancelled");
    }
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

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsUploading(true);
    setProgress(0);
    setUploadStage("uploading");

    const startTime = Date.now();
    const cleanBaseUrl = (BASE_URL || "").replace(/\/$/, "");
    const uploadUrl = `${cleanBaseUrl}${VIDEOS_URL}/upload-content`;
    const token = accessToken || localStorage.getItem("accessToken") || userInfo?.accessToken;

    try {
      const response = await axios.post(uploadUrl, data, {
        signal: controller.signal,
        withCredentials: true,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const currentPercent = Math.min(
              100,
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            );
            setProgress(currentPercent);

            const loaded = (progressEvent.loaded / (1024 * 1024)).toFixed(1);
            const total = (progressEvent.total / (1024 * 1024)).toFixed(1);
            setUploadedMB(loaded);
            setTotalMB(total);

            // Compute transfer speed in MB/s
            const elapsedSeconds = (Date.now() - startTime) / 1000;
            if (elapsedSeconds > 0.4) {
              const speed = (progressEvent.loaded / (1024 * 1024) / elapsedSeconds).toFixed(1);
              setUploadSpeed(`${speed} MB/s`);
            }

            if (currentPercent >= 100) {
              setUploadStage("processing");
            }
          }
        },
      });

      if (response?.data?.success || response?.status === 201 || response?.status === 200) {
        setProgress(100);
        setUploadStage("success");
        dispatch(apiSlice.util.invalidateTags(["Video"]));
        toast.success("Video uploaded and published successfully 🎉");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (err) {
      if (axios.isCancel(err) || err.name === "CanceledError") {
        return; // User explicitly cancelled
      }
      console.error("Upload failed:", err);
      setUploadStage("error");
      setIsUploading(false);
      setProgress(0);
      const errMsg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Upload failed. Please check file format and try again.";
      toast.error(errMsg);
    }
  };

  const videoSizeMB = formData.video ? (formData.video.size / (1024 * 1024)).toFixed(1) : 0;
  const isLargeVideo = Number(videoSizeMB) > 25;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-xl bg-gradient-to-b from-gray-900/90 to-gray-950/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={isUploading}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition disabled:opacity-40"
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
              disabled={isUploading}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition disabled:opacity-50"
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
              disabled={isUploading}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition resize-none disabled:opacity-50"
              rows="4"
              required
            />
          </div>

          {/* Video File Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Video File
              </label>
              {isLargeVideo && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Large Video File ({videoSizeMB} MB)
                </span>
              )}
            </div>
            <div className={`relative border-2 border-dashed rounded-2xl p-4 transition bg-white/[0.02] ${
              isUploading ? "border-gray-700 opacity-60" : "border-white/15 hover:border-red-500/50"
            }`}>
              <input
                type="file"
                name="video"
                accept="video/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                required
              />
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/10 text-red-400 rounded-xl shrink-0">
                  <Video className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {formData.video ? formData.video.name : "Select video file (MP4, MKV, MOV)"}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                    {formData.video ? (
                      <>
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>{videoSizeMB} MB</span>
                      </>
                    ) : (
                      "Click or drag & drop to choose video"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnail File Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Thumbnail Image
            </label>
            <div className={`relative border-2 border-dashed rounded-2xl p-4 transition bg-white/[0.02] ${
              isUploading ? "border-gray-700 opacity-60" : "border-white/15 hover:border-blue-500/50"
            }`}>
              <input
                type="file"
                name="thumbnail"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                required
              />
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl shrink-0">
                  <Image className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {formData.thumbnail ? formData.thumbnail.name : "Select thumbnail image (JPG, PNG, WebP)"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formData.thumbnail ? `${(formData.thumbnail.size / 1024).toFixed(1)} KB` : "Click or drag & drop to choose thumbnail"}
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
                disabled={isUploading}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* REAL-TIME PROGRESS BAR & STAGE DISPLAY */}
          {isUploading && (
            <div className="p-5 rounded-2xl bg-gradient-to-b from-gray-800/90 to-gray-900/90 border border-white/10 shadow-xl space-y-3">
              {/* Top row: Stage Title + Percentage */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {uploadStage === "uploading" && (
                    <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                  )}
                  {uploadStage === "processing" && (
                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  )}
                  {uploadStage === "success" && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                  <span className="text-sm font-semibold text-white">
                    {uploadStage === "uploading" && "Uploading to Server..."}
                    {uploadStage === "processing" && "Processing on Cloudinary..."}
                    {uploadStage === "success" && "Upload Complete!"}
                  </span>
                </div>
                <span className="text-sm font-bold text-red-400 font-mono">
                  {progress}%
                </span>
              </div>

              {/* Graphical Progress Bar */}
              <div className="w-full h-3 bg-gray-950/80 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-200 ${
                    uploadStage === "processing"
                      ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-pulse"
                      : "bg-gradient-to-r from-red-600 via-pink-500 to-red-400"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Detailed Metrics: MB Transferred & Speed */}
              <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-gray-500" />
                  <span>
                    {uploadStage === "uploading"
                      ? `${uploadedMB} MB / ${totalMB} MB`
                      : uploadStage === "processing"
                      ? "All bytes sent • Encoding stream"
                      : "Done"}
                  </span>
                </div>

                {uploadSpeed && uploadStage === "uploading" && (
                  <div className="flex items-center gap-1 text-gray-300">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <span>{uploadSpeed}</span>
                  </div>
                )}
              </div>

              {/* Informative Guidance for Large Videos during Cloudinary processing */}
              {uploadStage === "processing" && (
                <p className="text-[11px] text-purple-300/90 bg-purple-950/30 border border-purple-500/20 p-2.5 rounded-xl">
                  🚀 Your video is now being processed in chunks and optimized by Cloudinary for streaming. For longer videos, this may take 30–60 seconds. Please keep this tab open!
                </p>
              )}

              {/* Cancel Button */}
              {uploadStage === "uploading" && (
                <div className="pt-2 text-right">
                  <button
                    type="button"
                    onClick={handleCancelUpload}
                    className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel upload
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          {!isUploading && (
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-red-600/30 transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Upload Video</span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default UploadVideo;

