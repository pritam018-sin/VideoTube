// controllers/like.controller.js
import { Like } from "../models/like.Model.js";
import { Video } from "../models/video.Model.js";
import { Comment } from "../models/comment.Model.js";
import { Tweet } from "../models/tweet.Model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";

export const toggleLike = (resourceType) => {
  return asyncHandler(async (req, res) => {
    const id = req.params.id || req.params.commentId || req.params.videoId || req.params.tweetId;
    const userId = req.user._id;

    if (!id) {
      throw new ApiError(400, "Resource ID is required");
    }

    // Filter dynamically (video/comment/tweet)
    const filter = { [resourceType]: id, likedBy: userId };

    // Check if already liked in Like collection
    const existingLike = await Like.findOne(filter);

    // Also check if already in model's likes array (for backward compatibility)
    let alreadyInArray = false;
    if (resourceType === "video") {
      const vid = await Video.findById(id).select("likes");
      alreadyInArray = vid?.likes?.some((uid) => uid.toString() === userId.toString());
    } else if (resourceType === "comment") {
      const comm = await Comment.findById(id).select("likes");
      alreadyInArray = comm?.likes?.some((uid) => uid.toString() === userId.toString());
    } else if (resourceType === "tweet") {
      const twt = await Tweet.findById(id).select("likes");
      alreadyInArray = twt?.likes?.some((uid) => uid.toString() === userId.toString());
    }

    let isLiked = false;
    let message;
    if (existingLike || alreadyInArray) {
      // If already liked → unlike
      if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
      }
      if (resourceType === "video") {
        await Video.findByIdAndUpdate(id, { $pull: { likes: userId } });
      } else if (resourceType === "comment") {
        await Comment.findByIdAndUpdate(id, { $pull: { likes: userId } });
      } else if (resourceType === "tweet") {
        await Tweet.findByIdAndUpdate(id, { $pull: { likes: userId } });
      }
      message = "Unliked successfully";
      isLiked = false;
    } else {
      // New like
      await Like.create({ [resourceType]: id, likedBy: userId });
      if (resourceType === "video") {
        await Video.findByIdAndUpdate(id, { $addToSet: { likes: userId } });
      } else if (resourceType === "comment") {
        await Comment.findByIdAndUpdate(id, { $addToSet: { likes: userId } });
      } else if (resourceType === "tweet") {
        await Tweet.findByIdAndUpdate(id, { $addToSet: { likes: userId } });
      }
      message = "Liked successfully";
      isLiked = true;
    }

    // Count updated likes from Like collection
    const countFromCollection = await Like.countDocuments({ [resourceType]: id });
    let countFromArray = 0;
    if (resourceType === "video") {
      const vid = await Video.findById(id).select("likes");
      countFromArray = vid?.likes?.length || 0;
    }
    const likesCount = Math.max(countFromCollection, countFromArray);

    return res.status(200).json(
      new ApiResponse(200, { likesCount, isLiked }, message)
    );
  });
};
