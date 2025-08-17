import {asyncHandler} from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import {User} from '../models/user.Model.js';
import { cloudinaryUpload } from '../utils/cloudnaryService.js';
import { ApiResponse } from '../utils/apiResponse.js';

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
    if(!username || !email){
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
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
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
})

export { 
    registerUser,
    loginUser,
    logoutUser

 };