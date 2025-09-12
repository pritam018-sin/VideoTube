import {asyncHandler} from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import { Video } from '../models/video.Model.js';
import { Comment } from '../models/comment.Model.js';
import { cloudinaryUpload } from '../utils/cloudnaryService.js';
import { ApiResponse } from '../utils/apiResponse.js';

const uploadContent = asyncHandler(async (req, res) => {
    const { title, description, isPublished} = req.body;

    // validation for required fields
    if ([title, description].some(field => !field || field.trim() === "")) {
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
        duration: uploadedVideo.duration,   // ⚡ Cloudinary gives duration
        owner: req.user._id,
        isPublished: isPublished ?? false
    });

    res.status(201).json(
        new ApiResponse(201, "Video uploaded successfully", video)
    );
});

const updateVideo = asyncHandler(async (req, res) => {
    const { title, description, isPublished } = req.body;

    if ([title, description].some(field => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        req.params.id,
        {
            $set: {
                title: title.trim(),
                description: description.trim(),
                isPublished: isPublished ?? false,
            },
        },
        { new: true, runValidators: true }  // new:true -> updated doc return karega
    );

    if (!updatedVideo) {
        throw new ApiError(404, "Video not found");
    }

    res.status(200).json(
        new ApiResponse(200, "Video updated successfully", updatedVideo)
    );
});
const updateVideoThumbnail = asyncHandler(async (req, res) => {
    // Multer single file => req.file
    const thumbnailLocalPath = req.file?.path;

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required");
    }

    // Upload to Cloudinary
    const thumbnail = await cloudinaryUpload(thumbnailLocalPath);

    if (!thumbnail) {
        throw new ApiError(400, "Thumbnail upload failed");
    }

    // Update video thumbnail in DB
    const video = await Video.findByIdAndUpdate(
        req.params.id, // video id from URL
        { $set: { thumbnail: thumbnail.url } },
        { new: true }
    );

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Thumbnail updated successfully")
    );
});

const togglePublish = asyncHandler(async (req, res) => {
    const videoId = req.params.id; // tumne routes me :id use kiya tha

    // Find video
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Toggle publish status
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: { isPublished: !video.isPublished } },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Publish status updated successfully")
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

    return res.status(200).json(
        new ApiResponse(200, null, "Video deleted successfully")
    );
});

const getAllVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find({ isPublished: true }).populate('owner', 'fullname username avatar');

    if (!videos || videos.length === 0) {
        return res.status(404).json(
            new ApiResponse(404, null, "No videos found")
        );
    }
    res.status(200).json(
        new ApiResponse(200, "All videos fetched successfully", videos)
    );
});

const getVideoById = asyncHandler(async (req, res) => {
    const videoId = req.params.id;
    const video  = await Video.findById(videoId)
        .populate('owner', 'username avatar fullname')
        .populate({
            path: 'comments',
            populate: { path: 'owner', select: 'fullname avatar username' }
        })
        .populate('likes', 'username avatar fullname');

   if (!video) {
       return res.status(404).json(
           new ApiResponse(404, null, "Video not found")
       );
   }

   // auto-increase view count
   video.views += 1;
   await video.save();

   res.status(200).json(
       new ApiResponse(200,"Video fetched successfully", video)
   );
});

const getUserVideos = asyncHandler(async (req, res) => {
    const {id} = req.params;

    const userVideos = await Video.find({owner: id, isPublished: true}).populate('owner', 'username avatar fullname');

   if (!userVideos || userVideos.length === 0) {
       return res.status(404).json(
           new ApiResponse(404, null, "No videos found for this user")
       );
   }

   res.status(200).json(
       new ApiResponse(200, "User videos fetched successfully", userVideos)
   );
});
const getMyVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id; // login user id from auth middleware

    const userVideos = await Video.find({ owner: userId })
        .populate("owner", "username avatar fullname");

    res.status(200).json(
        new ApiResponse(200, "My videos fetched successfully", userVideos)
    );
});
const toggleLikeVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const video = await Video.findById(id);
    if (!video) throw new ApiError(404, "Video not found");

    const alreadyLiked = video.likes.includes(userId);

    if (alreadyLiked) {
        video.likes = video.likes.filter(uid => uid.toString() !== userId.toString());
    } else {
        video.likes.push(userId);
    }

    await video.save();

    res.status(200).json(
        new ApiResponse(200, { likesCount: video.likes.length, liked: !alreadyLiked }, "Like status updated")
    );
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
    getMyVideos
}