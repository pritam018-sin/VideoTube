import {PlayList} from '../models/playlist.Model.js'
import { ApiResponse } from '../utils/apiResponse.js'
import ApiError from '../utils/apiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { Video } from '../models/video.Model.js'
import { User } from '../models/user.Model.js'

const createPlayList = asyncHandler(async (req, res) => {
    const { name, description} = req.body;

    if (!name || name.trim() === "") {
        throw new ApiError("Playlist name is required", 400);
    }

    const playList = await PlayList.create({
        name,
        description,
        owner: req.user._id
    });

    const populatedPlaylist = await PlayList.findById(playList._id)
    .populate("owner", "username email avatar");

    return res
   .status(200)
   .json(
        new ApiResponse(
            200,
            {
                populatedPlaylist
            },
            "Playlist created successfully"
        )
   )

});
//update Playlist

const updatePlayList = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || name.trim() === "") {
        throw new ApiError("Playlist name is required", 400);
    }

    const updatedPlayList = await PlayList.findByIdAndUpdate(
        req.params?.id,
        {
            $set: {
                name,
                description
            }
        },
        { new: true }
    ).populate("owner", "username email avatar");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    updatedPlayList
                },
                "Playlist updated successfully"
            )
        );
});

//delete Playlist
const deletePlayList = asyncHandler(async (req, res) => {
    const deletedPlayList = await PlayList.findByIdAndDelete(req.params?.id);

    if (!deletedPlayList) {
        throw new ApiError("Playlist not found", 404);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    deletedPlayList
                },
                "Playlist deleted successfully"
            )
        );
});

//add Video to playlist
const addVideoToPlayList = asyncHandler(async (req, res) => {
   const { playlistId, videoId } = req.params;

     // check video exist
  const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError("Video not found", 404);
    }

    const playlist = await PlayList.findById(playlistId);

    if(!playlist){
        throw new ApiError("Playlist not found", 403);
    }
    const updatedPlayList = await PlayList.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {
                videos: videoId
            }
        },
        { new: true }
    ).populate("videos");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    updatedPlayList
                },
                "Video added to playlist successfully"
            )
        );
});

//rem video From Playlist
const removeVideoFromPlayList = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError("Video not found", 404);
    }

    const playlist = await PlayList.findById(playlistId);

    if (!playlist) {
        throw new ApiError("Playlist not found", 403);
    }

    const updatedPlayList = await PlayList.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
            }
        },
        { new: true }
    ).populate("videos");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    updatedPlayList
                },
                "Video removed from playlist successfully"
            )
        );
});

//get all playlist
const getUserAllPlayLists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError("User not found", 404);
    }

     const playlists = await PlayList.find({ owner: userId }).populate("videos");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    playlists
                },
                "Playlists fetched successfully"
            )
        );
});

//get Single Playlist with videos
const getSinglePlayList = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;


    const playlist = await PlayList.findById(playlistId).populate("videos");

    if (!playlist) {
        throw new ApiError("Playlist not found", 404);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    playlist
                },
                "Playlist fetched successfully"
            )
        );
});

export {
    createPlayList,
    updatePlayList,
    deletePlayList,
    removeVideoFromPlayList,
    addVideoToPlayList,
    getUserAllPlayLists,
    getSinglePlayList
}
