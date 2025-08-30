// controllers/toggleLike.Controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/apiResponse.js";

export const toggleLike = (resourceModel) => {
  return asyncHandler(async (req, res) => {
    const { id } = req.params;      // Resource ID (Video / Comment / Post)
    const userId = req.user._id;    // Logged-in user

    const resource = await resourceModel.findById(id);
    if (!resource) {
      return res.status(404).json(new ApiResponse(404, null, "Resource not found"));
    }

    // Toggle logic
    const index = resource.likes.indexOf(userId);
    let message;
    if (index === -1) {
      resource.likes.push(userId);
      message = "Liked successfully";
    } else {
      resource.likes.splice(index, 1);
      message = "Unliked successfully";
    }

    await resource.save();

    return res.status(200).json(
      new ApiResponse(200, { likesCount: resource.likes.length }, message)
    );
  });
};