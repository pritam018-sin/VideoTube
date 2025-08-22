import {asyncHandler} from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import { Video } from '../models/video.Model.js';
import { cloudinaryUpload } from '../utils/cloudnaryService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const uploadContent = asyncHandler(async (req, res) => {
    const { title, description, isPublished} = req.body;

    // validation for required fields
    if(
        [title, description].some((field) => field?.trim() === "")
    ) {
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
        isPublished: isPublished 
    });

    res.status(201).json(
        new ApiResponse(201, "Video uploaded successfully", video)
    );
});

export {
    uploadContent,
}