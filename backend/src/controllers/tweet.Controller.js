import { Tweet } from "../models/tweet.Model.js";
import { asyncHandler } from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ensureHttps } from '../utils/ensureHttps.js';
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    console.log("Creating tweet with content:", content);   

    if (!content) {
        throw new ApiError(400, 'Content is required');
    }

    const newTweet = await Tweet.create({
        content,
        owner: req.user?._id
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Tweet created successfully",
                newTweet
            )
        );
});

const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const tweetId = req.params.tweetId || req.params.id;

    if (!content || !content.trim()) {
        throw new ApiError(400, 'Content is required');
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, 'Tweet not found');
    }

    // Ownership check
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You are not authorized to update this tweet');
    }

    tweet.content = content.trim();
    await tweet.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Tweet updated successfully",
                tweet
            )
        );
});

const deleteTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.tweetId || req.params.id;

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, 'Tweet not found');
    }

    // Ownership check
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You are not authorized to delete this tweet');
    }

    await tweet.deleteOne();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Tweet deleted successfully",
                null
            )
        );
});

const sanitizeTweet = (tweet) => {
    if (!tweet) return tweet;
    if (tweet.owner?.avatar) {
        tweet.owner.avatar = ensureHttps(tweet.owner.avatar);
    }
    return tweet;
};

const getUserTweets = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const currentUserId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;

    const tweets = await Tweet.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        { $unwind: "$owner" },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likesData"
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                "owner._id": 1,
                "owner.username": 1,
                "owner.fullname": 1,
                "owner.avatar": 1,
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
                    : false
            }
        }
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "User tweets fetched successfully",
                (tweets || []).map(sanitizeTweet)
            )
        );
});

const getTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.id || req.params.tweetId;
    const currentUserId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;

    const tweet = await Tweet.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(tweetId) } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        { $unwind: "$owner" },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likesData"
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                "owner._id": 1,
                "owner.username": 1,
                "owner.fullname": 1,
                "owner.avatar": 1,
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
                    : false
            }
        }
    ]);

    if (!tweet || tweet.length === 0) {
        throw new ApiError(404, 'Tweet not found');
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Tweet fetched successfully",
                sanitizeTweet(tweet[0])
            )
        );
});

const getAllTweets = asyncHandler(async (req, res) => {
    const currentUserId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;

    const tweets = await Tweet.aggregate([
        { $match: {} },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        { $unwind: "$owner" },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likesData"
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                "owner._id": 1,
                "owner.username": 1,
                "owner.fullname": 1,
                "owner.avatar": 1,
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
                    : false
            }
        }
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "All tweets fetched successfully",
                (tweets || []).map(sanitizeTweet)
            )
        );
});

export {
    createTweet,
    updateTweet,
    deleteTweet,
    getAllTweets,
    getTweet,
    getUserTweets
};
