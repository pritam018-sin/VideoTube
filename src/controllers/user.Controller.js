import {asyncHandler} from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import {User} from '../models/user.Model.js';
import { cloudinaryUpload } from '../utils/cloudnaryService.js';
import { ApiResponse } from '../utils/apiResponse.js';

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

})

export { registerUser };