import { ApiResponse } from "../utils/apiResponse.js";
import ApiError from '../utils/apiError.js';
import { Subscription } from "../models/subscription.Model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Subscribe / Unsubscribe toggle
const toggleSubscription = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { channelId } = req.params;

    if (userId.toString() === channelId) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    const existing = await Subscription.findOne({ subscriber: userId, channel: channelId });

    let message;
    if (existing) {
        await Subscription.findByIdAndDelete(existing._id);
        message = "Unsubscribed successfully";
    } else {
        await Subscription.create({ subscriber: userId, channel: channelId });
        message = "Subscribed successfully";
    }

    const subscribersCount = await Subscription.countDocuments({ channel: channelId });

    res.status(200).json(new ApiResponse(200, { subscribersCount }, message));
});

// Get all channels a user has subscribed to
 const getSubscribedChannels = asyncHandler(async (req, res) => {
    const userId = req.user._id;  // logged-in user

    // Find all subscriptions where user is the subscriber
    const subscriptions = await Subscription.find({ subscriber: userId }).populate("channel", "name avatar");

    if (!subscriptions.length) {
        throw new ApiError(404, "You haven't subscribed to any channels yet");
    }

    // Map to return only channel info
    const channels = subscriptions.map(sub => sub.channel);

    res.status(200).json(new ApiResponse(200, { channels }, "Subscribed channels fetched successfully"));
});
export {
    toggleSubscription,
    getSubscribedChannels   
}