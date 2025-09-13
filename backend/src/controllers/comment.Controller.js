import { Comment } from "../models/comment.Model.js";
import { Video } from "../models/video.Model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import ApiError from '../utils/apiError.js';
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const {content} = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment cannot be empty");
    }

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: req.user._id
    });

    video.comments.push(comment._id);
    await video.save();

    res.status(201).json(
        new ApiResponse(201, comment, "Comment added successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { videoId, commentId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    // only comment owner or video owner can delete
    if (
        comment.owner.toString() !== req.user._id.toString() &&
        video.owner.toString() !== req.user._id.toString()
    ) {
        throw new ApiError(403, "Not authorized to delete this comment");
    }

    await comment.deleteOne();

    video.comments = video.comments.filter(
        (c) => c.toString() !== commentId.toString()
    );
    await video.save();

    res.status(200).json(
        new ApiResponse(200, null, "Comment deleted successfully")
    );
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment cannot be empty");
    }

    // Comment ke sath video.owner bhi le aate hain
    const comment = await Comment.findById(commentId)
        .populate("video", "owner");  // sirf video.owner le aaya

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // sirf comment owner ya video owner ko allow karo
    if (
        comment.owner.toString() !== req.user._id.toString() &&
        comment.video.owner.toString() !== req.user._id.toString()
    ) {
        throw new ApiError(403, "Not authorized to update this comment");
    }

    // update the comment
    comment.content = content.trim();
    await comment.save();

    res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    );
});



const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
   
  // ✅ Step 1: validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID", videoId);
  }

  // ✅ Step 2: ensure video exists
  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  // ✅ Step 3: aggregation pipeline
  const comments = await Comment.aggregate([
    { $match: { video: new mongoose.Types.ObjectId(videoId) } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerInfo",
      },
    },
    { $unwind: "$ownerInfo" },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        content: 1,
        text: 1,
        createdAt: 1,
        "ownerInfo.username": 1,
        "ownerInfo.avatar": 1,
        "ownerInfo._id": 1,
        "ownerInfo.fullname": 1,
        likes: { $size: { $ifNull: ["$likes", []] } },
      },
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, "Comments fetched successfully", comments));
});


export {
    addComment,
    deleteComment,
    updateComment,
    getVideoComments
}