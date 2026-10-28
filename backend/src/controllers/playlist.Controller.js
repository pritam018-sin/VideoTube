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
        owner: req.user?._id
    });

    const populatedPlaylist = await PlayList.findById(playList._id)
    .populate("owner", "username email avatar");

    return res
   .status(200)
   .json(
        new ApiResponse(
            200,
             "Playlist created successfully",
            {
                populatedPlaylist
            }
        )
   )

});
//update Playlist

const updatePlayList = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || name.trim() === "") {
        throw new ApiError("Playlist name is required", 400);
    }

    const playlist = await PlayList.findById(req.params?.playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this playlist");
    }

    playlist.name = name.trim();
    if (description !== undefined) playlist.description = description.trim();
    await playlist.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Playlist updated successfully",
                { updatedPlayList: playlist }
            )
        );
});

//delete Playlist
const deletePlayList = asyncHandler(async (req, res) => {
    const playlist = await PlayList.findById(req.params?.playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this playlist");
    }

    await playlist.deleteOne();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Playlist deleted successfully",
                null
            )
        );
});

//add Video to playlist
const addVideoToPlayList = asyncHandler(async (req, res) => {
   const { playlistId, videoId } = req.params;

   const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const playlist = await PlayList.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to modify this playlist");
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
                "Video added to playlist successfully",
                { updatedPlayList }
            )
        );
});

//rem video From Playlist
const removeVideoFromPlayList = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const playlist = await PlayList.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to modify this playlist");
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
                "Playlists fetched successfully",
                {
                    playlists
                }
            )
        );
});

//get Single Playlist with videos
const getSinglePlayList = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;


    const playlist = await PlayList.findById(playlistId)
                    .populate("videos")
                    .populate("owner", "username email fullname avatar");

    if (!playlist) {
        throw new ApiError("Playlist not found", 404);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Playlist fetched successfully",
                {
                    playlist
                }
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
