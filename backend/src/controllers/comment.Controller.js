import { Comment } from "../models/comment.Model.js";
import { Video } from "../models/video.Model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import ApiError from '../utils/apiError.js';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ensureHttps } from "../utils/ensureHttps.js";
import mongoose from "mongoose";

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content, parentComment } = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment cannot be empty");
    }

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: req.user._id,
        parentComment: parentComment || null
    });

    if (!parentComment) {
        video.comments.push(comment._id);
        await video.save();
    }

    res.status(201).json(
        new ApiResponse(201, "Comment added successfully", comment)
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { videoId, commentId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    // Only comment owner or video owner can delete
    if (
        comment.owner.toString() !== req.user._id.toString() &&
        video.owner.toString() !== req.user._id.toString()
    ) {
        throw new ApiError(403, "Not authorized to delete this comment");
    }

    // Also delete any replies to this comment
    await Comment.deleteMany({ parentComment: commentId });
    await comment.deleteOne();

    video.comments = video.comments.filter(
        (c) => c.toString() !== commentId.toString()
    );
    await video.save();

    res.status(200).json(
        new ApiResponse(200, "Comment deleted successfully", null)
    );
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment cannot be empty");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Only comment owner can update comment content
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to update this comment");
    }

    comment.content = content.trim();
    await comment.save();

    res.status(200).json(
        new ApiResponse(200, "Comment updated successfully", comment)
    );
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const currentUserId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;
   
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  const comments = await Comment.aggregate([
    { 
      $match: { 
        video: new mongoose.Types.ObjectId(videoId),
        $or: [{ parentComment: null }, { parentComment: { $exists: false } }]
      } 
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerInfo",
      },
    },
    { $unwind: "$ownerInfo" },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likesData"
      }
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "parentComment",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerInfo"
            }
          },
          { $unwind: "$ownerInfo" },
          { $sort: { createdAt: 1 } },
          {
            $project: {
              content: 1,
              createdAt: 1,
              "ownerInfo.username": 1,
              "ownerInfo.avatar": 1,
              "ownerInfo._id": 1,
              "ownerInfo.fullname": 1
            }
          }
        ],
        as: "replies"
      }
    },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        content: 1,
        createdAt: 1,
        "ownerInfo.username": 1,
        "ownerInfo.avatar": 1,
        "ownerInfo._id": 1,
        "ownerInfo.fullname": 1,
        likesCount: {
          $max: [
            { $size: "$likesData" },
            { $size: { $ifNull: ["$likes", []] } }
          ]
        },
        isLiked: currentUserId
          ? {
              $or: [
                { $in: [currentUserId, "$likesData.likedBy"] },
                { $in: [currentUserId, { $ifNull: ["$likes", []] }] }
              ]
            }
          : false,
        replies: 1
      },
    },
  ]);

  const sanitizedComments = comments.map((c) => {
    if (c.ownerInfo?.avatar) c.ownerInfo.avatar = ensureHttps(c.ownerInfo.avatar);
    if (Array.isArray(c.replies)) {
      c.replies.forEach((r) => {
        if (r.ownerInfo?.avatar) r.ownerInfo.avatar = ensureHttps(r.ownerInfo.avatar);
      });
    }
    return c;
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Comments fetched successfully", sanitizedComments));
});

export {
    addComment,
    deleteComment,
    updateComment,
    getVideoComments
}