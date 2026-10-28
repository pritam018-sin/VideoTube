import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { Video } from "../models/video.Model.js";
import { Comment } from "../models/comment.Model.js";
import { Like } from "../models/like.Model.js";
import { cloudinaryUpload } from "../utils/cloudnaryService.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ensureHttps } from "../utils/ensureHttps.js";

const uploadContent = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;

  // validation for required fields
  if ([title, description].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  //video thumbnail
  const videoLocalPath = req.files?.video?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video and thumbnail are required");
  }

  // upload video to cloudinary
  const uploadedVideo = await cloudinaryUpload(videoLocalPath);

  // upload thumbnail to cloudinary
  const uploadedThumbnail = await cloudinaryUpload(thumbnailLocalPath);

  // save in DB
  const video = await Video.create({
    videoFile: uploadedVideo.secure_url,
    thumbnail: uploadedThumbnail.secure_url,
    title: title.trim(),
    description: description.trim(),
    duration: uploadedVideo.duration, // ⚡ Cloudinary gives duration
    owner: req.user._id,
    isPublished: isPublished ?? false,
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Video uploaded successfully", video));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;

  if ([title, description].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const video = await Video.findById(req.params.id);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  video.title = title.trim();
  video.description = description.trim();
  if (isPublished !== undefined) video.isPublished = isPublished;
  await video.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Video updated successfully", video));
});

const updateVideoThumbnail = asyncHandler(async (req, res) => {
  const thumbnailLocalPath = req.file?.path;

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file is required");
  }

  const video = await Video.findById(req.params.id);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  // Upload to Cloudinary
  const thumbnail = await cloudinaryUpload(thumbnailLocalPath);
  if (!thumbnail) {
    throw new ApiError(400, "Thumbnail upload failed");
  }

  video.thumbnail = thumbnail.secure_url || thumbnail.url;
  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Thumbnail updated successfully", video));
});

const togglePublish = asyncHandler(async (req, res) => {
  const videoId = req.params.id;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to change publish status of this video");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Publish status updated successfully", video)
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const videoId = req.params.id;

  // Find video
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check ownership
  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this video");
  }

  // Delete video
  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successfully"));
});

const getAllVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({ isPublished: true }).populate(
    "owner",
    "fullname username avatar"
  );

  if (!videos || videos.length === 0) {
    return res.status(404).json(new ApiResponse(404, null, "No videos found"));
  }
  res
    .status(200)
    .json(new ApiResponse(200, "All videos fetched successfully", videos.map(sanitizeVideo)));
});

const getVideoById = asyncHandler(async (req, res) => {
  const videoId = req.params.id;
  const video = await Video.findById(videoId)
    .populate("owner", "username avatar fullname")
    .populate({
      path: "comments",
      populate: { path: "owner", select: "fullname avatar username" },
    });

  if (!video) {
    return res.status(404).json(new ApiResponse(404, null, "Video not found"));
  }

  // Atomic view increment (avoids validation errors on populated subdocuments)
  await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

  // Aggregate likes from Like collection and video.likes array for 100% accuracy
  const countFromCollection = await Like.countDocuments({ video: videoId });
  const countFromArray = video.likes?.length || 0;
  const likesCount = Math.max(countFromCollection, countFromArray);

  const isLikedInCollection = req.user
    ? !!(await Like.findOne({ video: videoId, likedBy: req.user._id }))
    : false;
  const isLikedInArray =
    req.user && Array.isArray(video.likes)
      ? video.likes.some((uid) => uid.toString() === req.user._id.toString())
      : false;
  const isLiked = isLikedInCollection || isLikedInArray;

  const videoData = video.toObject();
  videoData.views = (videoData.views || 0) + 1;
  videoData.likesCount = likesCount;
  videoData.isLiked = isLiked;

  // Sanitize all URLs to HTTPS to permanently eliminate mixed content warnings
  if (videoData.videoFile) videoData.videoFile = ensureHttps(videoData.videoFile);
  if (videoData.thumbnail) videoData.thumbnail = ensureHttps(videoData.thumbnail);
  if (videoData.owner?.avatar) videoData.owner.avatar = ensureHttps(videoData.owner.avatar);
  if (videoData.comments && Array.isArray(videoData.comments)) {
    videoData.comments.forEach((c) => {
      if (c.owner?.avatar) c.owner.avatar = ensureHttps(c.owner.avatar);
    });
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Video fetched successfully", videoData));
});

const sanitizeVideo = (v) => {
  if (!v) return v;
  const obj = typeof v.toObject === "function" ? v.toObject() : { ...v };
  if (obj.videoFile) obj.videoFile = ensureHttps(obj.videoFile);
  if (obj.thumbnail) obj.thumbnail = ensureHttps(obj.thumbnail);
  if (obj.owner?.avatar) obj.owner.avatar = ensureHttps(obj.owner.avatar);
  return obj;
};

const getUserVideos = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const userVideos = await Video.find({
    owner: id,
    isPublished: true,
  }).populate("owner", "username avatar fullname");

  if (!userVideos || userVideos.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "No videos found for this user"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "User videos fetched successfully", userVideos.map(sanitizeVideo)));
});

const getMyVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id; // login user id from auth middleware

  const userVideos = await Video.find({ owner: userId }).populate(
    "owner",
    "username avatar fullname"
  );

  res
    .status(200)
    .json(new ApiResponse(200, "My videos fetched successfully", userVideos.map(sanitizeVideo)));
});

const toggleLikeVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const video = await Video.findById(id);
  if (!video) throw new ApiError(404, "Video not found");

  const alreadyLiked = video.likes.includes(userId);

  if (alreadyLiked) {
    video.likes = video.likes.filter(
      (uid) => uid.toString() !== userId.toString()
    );
  } else {
    video.likes.push(userId);
  }

  await video.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { likesCount: video.likes.length, liked: !alreadyLiked },
        "Like status updated"
      )
    );
});

// GET /api/videos/search?query=keyword
const searchVideos = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) {
    throw new ApiError(404, "Query is Required");
  }

  const videos = await Video.find({
    title: { $regex: query, $options: "i" }, // title me search
  }).populate("owner", "username avatar fullname");

  res
    .status(200)
    .json(new ApiResponse(200, "Videos fetched successfully", videos.map(sanitizeVideo)));
});

// GET /api/videos/top
const getTopVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find()
    .sort({ views: -1 }) // highest views first
    .limit(10) // only top 10
    .populate("owner", "fullname avatar");

  res
    .status(200)
    .json(new ApiResponse(200, "Top videos fetched successfully", videos.map(sanitizeVideo)));
});

export {
  uploadContent,
  updateVideo,
  updateVideoThumbnail,
  togglePublish,
  toggleLikeVideo,
  deleteVideo,
  getAllVideos,
  getVideoById,
  getUserVideos,
  getMyVideos,
  searchVideos,
  getTopVideos,
};
