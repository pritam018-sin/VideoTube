import {asyncHandler} from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import {Video} from "../models/video.Model.js";
import {User} from '../models/user.Model.js';
import { cloudinaryUpload } from '../utils/cloudnaryService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const generateAccessTokenAndRefreshTokens = async(userId) =>{
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
      await  user.save({validateBeforeSave: false});
      return { accessToken, refreshToken};

    }catch{error}{
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //get User Detail From Frontend
    const {fullname, email, username, password}= req.body;

    //validate User Input

    if(
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    //check if user allready Exist
   const existedUser = await User.findOne({
        $or: [
            {email},
            {username}
        ]
    })
    if(existedUser){
        throw new ApiError(409, "User with this Email or Username Already Exists");
    }

    //check for images, and avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    //upload them in cloudnary
   const avatar = await cloudinaryUpload(avatarLocalPath)
   const coverImage = await cloudinaryUpload(coverLocalPath)

   if(!avatar){
       throw new ApiError(400, "Avatar upload failed");
   }
   if(!coverImage){
       throw new ApiError(400, "Cover image upload failed");
   }
    //create User Object - create entry in db
   const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password,
        
    })
     //remove password and refresh token field from response

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    //check for user creation
    if(!createdUser){
        throw new ApiError(500, "User creation failed");
    }

    // return res
    res.status(201).json(
        new ApiResponse(201, "User created successfully", createdUser)
    )

});
const loginUser = asyncHandler(async (req, res) => {
    //req body = data;

    const {email, username, password} = req.body;

    //Username and email
    if(!(username || email)){
        throw new ApiError(400, "username or email is required")
    }

    //find the user
   const user = await User.findOne({
        $or: [{username}, {email}]
    })
    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    //password check
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid password");
    }

    //Access and refresh token 
    const { accessToken, refreshToken} = await generateAccessTokenAndRefreshTokens(user._id);

    //send cookie
   const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

   const options = {
    httpOnly: true,
    secure: true
   }

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
        new ApiResponse(
            200,
            "User logged In Successfully",
            {
                user: loggedInUser, accessToken, refreshToken
            },
            // "User logged In Successfully"
        )
   )

});
const logoutUser = asyncHandler(async (req, res) => {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken: undefined
                }
            },
            {
                new: true
            }
        )

        const options = {
        httpOnly: true,
        secure: true
        }

        return res
        .status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(
            new ApiResponse(
                200,
                {},
                "User Logged Out Successfully!"
            )
        )
});

const refreshAccessToken = asyncHandler(async (req,res) => {
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken){
    throw new ApiError(401, "Unauthorized Request");
   }
try {
    
       const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
       const user = await User.findById(decodedToken?._id)
    
       if(!user){
        throw new ApiError(404, "Invalid Refresh Token");
       }
    
       if(incomingRefreshToken !== user.refreshToken){
        throw new ApiError(401, "Refresh Toknen expired or used");
       }
    
       const options = {
        httpOnly: true,
        secure: true
       }
        const { accessToken, newRefreshToken } = await generateAccessTokenAndRefreshTokens(user._id);
    
       return res
       .status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", newRefreshToken, options)
       .json(
           new ApiResponse(
               200,
               {
                   accessToken,
                   newRefreshToken
               },
               "Access Token Refreshed Successfully"
           )
       )
} catch (error) {
   throw new ApiError(401, error?.message || "Invalid Refresh Token");
}

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Validate request body
    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Current password and new password are required");
    }

    // Find user
    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check current password
    const isPasswordValid = await user.isPasswordCorrect(currentPassword);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid current password");
    }

    // Change password
    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});
const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);

  // Aggregation pipeline
  const userWithStats = await User.aggregate([
    { $match: { _id: userId } },

    // Lookup videos created by this user
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos",
      },
    },

    // Add fields for counts
    {
      $addFields: {
        subscribersCount: { $size: { $ifNull: ["$subscribers", []] } },
        subscribedToCount: { $size: { $ifNull: ["$subscribedTo", []] } },
        videosCount: { $size: "$videos" },
        totalLikes: {
          $sum: {
            $map: {
              input: "$videos",
              as: "video",
              in: { $size: { $ifNull: ["$$video.likes", []] } },
            },
          },
        },
      },
    },

    // Limit fields to return (so password or sensitive data won't leak)
    {
      $project: {
        fullname: 1,
        username: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        subscribedToCount: 1,
        videosCount: 1,
        totalLikes: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, "Current user fetched successfully", userWithStats[0]));
});


const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body;

    // Validate request body
    if (!fullname && !email) {
        throw new ApiError(400, "Name or email is required");
    }

    // Find user and update details
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        { new: true }).select("-password");

    return res.status(200).json(
        new ApiResponse(200, user , "Account details updated successfully")
    );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    // Multer single file => req.file
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Upload to Cloudinary
    const avatar = await cloudinaryUpload(avatarLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed");
    }

    // Update user avatar in DB
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { avatar: avatar.url } },
        { new: true }
    ).select("-password");

    return res.status(200).json(
        new ApiResponse(200, user, "Avatar updated successfully")
    );
});


const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is required");
    }

    // Upload to Cloudinary
    const coverImage = await cloudinaryUpload(coverImageLocalPath);

    if (!coverImage) {
        throw new ApiError(400, "Cover image upload failed");
    }

    // Update user cover image
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { 
           $set: {
               coverImage: coverImage.url
           }
        },
        { new: true }
    ).select("-password");
    

    return res.status(200).json(
        new ApiResponse(200, user, "Cover image updated successfully")
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const {username} = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "User not found");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: { $size: "$subscribers" },
                channelSubscribedToCount: { $size: "$subscribedTo" },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "Channel not found");
    }

    return res.status(200).json(
        new ApiResponse(200,"User channel profile fetched successfully", channel[0])
    );
});
const addToWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;   // 👈 authMiddleware se aa raha
  const { videoId } = req.body; // 👈 frontend se bhejna padega

  if (!videoId) {
    return res.status(400).json(new ApiResponse(400, null, "Video ID is required"));
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { watchHistory: videoId } }, // 👈 duplicate avoid karega
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(200,"Video added to watch history", user.watchHistory)
  );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }


  const populatedUser = await User.findById(userId)
    .populate({
      path: "watchHistory",
      populate: {
        path: "owner",
        select: "fullname username avatar",
      },
    });

  return res.status(200).json(
    new ApiResponse(200, "Watch history fetched successfully", populatedUser.watchHistory)
  );
});



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    addToWatchHistory

 };