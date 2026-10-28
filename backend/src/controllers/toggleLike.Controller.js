// controllers/like.controller.js
import { Like } from "../models/like.Model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const toggleLike = (resourceType) => {
  return asyncHandler(async (req, res) => {
    const id = req.params.id || req.params.commentId || req.params.videoId || req.params.tweetId;
    const userId = req.user._id;

    if (!id) {
      throw new ApiError(400, "Resource ID is required");
    }

    // Filter dynamically (video/comment/tweet)
    const filter = { [resourceType]: id, likedBy: userId };

    // Check if already liked
    const existingLike = await Like.findOne(filter);

    let isLiked = false;
    let message;
    if (existingLike) {
      // If already liked → unlike
      await Like.findByIdAndDelete(existingLike._id);
      message = "Unliked successfully";
      isLiked = false;
    } else {
      // New like
      await Like.create({ [resourceType]: id, likedBy: userId });
      message = "Liked successfully";
      isLiked = true;
    }

    // Count updated likes
    const likesCount = await Like.countDocuments({ [resourceType]: id });

    return res.status(200).json(
      new ApiResponse(200, { likesCount, isLiked }, message)
    );
  });
};
