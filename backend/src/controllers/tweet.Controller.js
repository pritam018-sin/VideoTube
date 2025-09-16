import { Tweet } from "../models/tweet.Model.js";
import { asyncHandler } from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
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

    if (!content) {
        throw new ApiError('Content is required', 400);
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        req.params.tweetId,
        { $set: { content } },
        { new: true }
    );

    if (!updatedTweet) {
        throw new ApiError('Tweet not found', 404);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Tweet updated successfully",
                updatedTweet
            )
        );
});

const deleteTweet = asyncHandler(async (req, res) => {
    const deletedTweet = await Tweet.findByIdAndDelete(req.params.tweetId);

    if (!deletedTweet) {
        throw new ApiError('Tweet not found', 404);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Tweet deleted successfully",
                deletedTweet
            )
        );
});

const getUserTweets = asyncHandler(async (req, res) => {
    const userId = req.params.userId;

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
            $project: {
                content: 1,
                createdAt: 1,
                "owner._id": 1,
                "owner.username": 1,
                "owner.fullname": 1,
                "owner.avatar": 1
            }
        }
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "User tweets fetched successfully",
                tweets
            )
        );
});

const getTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.id;

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
            $project: {
                content: 1,
                createdAt: 1,
                "owner._id": 1,
                "owner.username": 1,
                "owner.fullname": 1,
                "owner.avatar": 1
            }
        }
    ]);

    if (!tweet || tweet.length === 0) {
        throw new ApiError('Tweet not found', 404);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Tweet fetched successfully",
                tweet[0]
            )
        );
});

const getAllTweets = asyncHandler(async (req, res) => {
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
            $project: {
                content: 1,
                createdAt: 1,
                "owner._id": 1,
                "owner.username": 1,
                "owner.fullname": 1,
                "owner.avatar": 1
            }
        }
    ]);

    if (!tweets || tweets.length === 0) {
        return res
            .status(404)
            .json(
                new ApiResponse(
                    404,
                    [],
                    "No tweets found"
                )
            );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "All tweets fetched successfully",
                tweets
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
