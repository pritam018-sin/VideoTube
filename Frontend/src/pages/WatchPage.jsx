import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetVideoByIdQuery,
  useToggleVideoLikeMutation,
} from "../redux/api/videoApiSlice.js";
import {
  useGetUserChannelProfileQuery,
  useAddToWatchHistoryMutation,
} from "../redux/api/userApiSlice.js";
import VideoDescription from "../components/VideoDescription.jsx";
import CommentList from "../components/CommentList.jsx";
import AddComment from "../components/AddComments.jsx";
import Subscription from "../components/Subscription.jsx";
import TopVideo from "../pages/Video/TopVideo.jsx";
import PlaylistMenu from "./playlist/PlaylistMenu.jsx";
import { ThumbsUp, Share2, Bookmark, Settings } from "lucide-react";
import { toast } from "react-toastify";
import { ensureHttps } from "../utils/url.js";

const WatchPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { videoId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetVideoByIdQuery(videoId);
  const video = data?.data || data;

  const { data: channelData } = useGetUserChannelProfileQuery(
    video?.owner?.username,
    {
      skip: !video?.owner?.username,
    }
  );

  const [addToWatchHistory] = useAddToWatchHistoryMutation();
  const [toggleLike, { isLoading: isLiking }] = useToggleVideoLikeMutation();

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (videoId) {
      addToWatchHistory(videoId);
    }
  }, [videoId, addToWatchHistory]);

  useEffect(() => {
    if (video) {
      setIsLiked(!!video.isLiked);
      setLikesCount(video.likesCount || 0);
    }
  }, [video]);

  const handleLike = async () => {
    if (!userInfo) {
      toast.info("Please login to like this video");
      navigate("/login");
      return;
    }
    const prevLiked = isLiked;
    const prevCount = likesCount;

    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await toggleLike(videoId).unwrap();
      const newIsLiked =
        res?.data?.isLiked !== undefined
          ? res.data.isLiked
          : res?.isLiked !== undefined
          ? res.isLiked
          : !prevLiked;
      const newLikesCount =
        res?.data?.likesCount !== undefined
          ? res.data.likesCount
          : res?.likesCount !== undefined
          ? res.likesCount
          : prevLiked
          ? Math.max(0, prevCount - 1)
          : prevCount + 1;

      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error(err?.data?.message || err?.message || "Failed to like video");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Video link copied to clipboard!");
  };

  if (isLoading) return <p className="text-gray-400 p-8 text-center">Loading video...</p>;
  if (error) return <p className="text-red-500 p-8 text-center">Error loading video.</p>;
  if (!video) return <p className="text-gray-400 p-8 text-center">Video not found</p>;

  const handleClickChannel = () => {
    navigate(`/user-channel/${video.owner?.username}`);
  };

  const isOwner =
    userInfo &&
    (userInfo._id === video?.owner?._id || userInfo._id === video?.owner);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 text-white">
      {/* LEFT SECTION (Main Video + Details) */}
      <div className="flex-1">
        {/* Video Player */}
        <div className="relative aspect-video w-full bg-black/90 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          <video
            src={ensureHttps(video.videoFile)}
            controls
            className="w-full h-full object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
          {video.title}
        </h1>

        {/* Action Bar (Views, Likes, Share, Playlist) */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pb-4 border-b border-white/10">
          <div className="text-sm text-gray-400">
            <span>{video.views || 0} views</span> ·{" "}
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition duration-200 cursor-pointer ${
                isLiked
                  ? "bg-red-500/20 text-red-500 border border-red-500/30"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <ThumbsUp
                className={`w-4 h-4 ${isLiked ? "fill-red-500" : ""}`}
              />
              <span>{likesCount}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            {/* Save to Playlist */}
            <PlaylistMenu
              userId={userInfo?._id}
              videoId={videoId}
              customTrigger={
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition cursor-pointer">
                  <Bookmark className="w-4 h-4" />
                  <span>Save</span>
                </button>
              }
            />

            {/* Owner Manage Button */}
            {isOwner && (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-sm font-medium transition"
              >
                <Settings className="w-4 h-4" />
                <span>Manage</span>
              </Link>
            )}
          </div>
        </div>

        {/* Channel Info & Subscribe */}
        <div className="flex items-center justify-between mt-5 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
          <div
            className="flex items-center gap-3 group cursor-pointer"
            onClick={handleClickChannel}
          >
            <img
              src={ensureHttps(video.owner?.avatar) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt={video.owner?.username}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-red-500 transition duration-300"
            />
            <div>
              <span className="text-base font-semibold text-white group-hover:text-red-400 transition">
                {video.owner?.fullname || video.owner?.username}
              </span>
              <p className="text-xs text-gray-400">
                @{video.owner?.username} ·{" "}
                {channelData?.data?.subscribersCount || 0} subscribers
              </p>
            </div>
          </div>
          <Subscription
            channelId={video.owner?._id}
            isSubscribed={channelData?.data?.isSubscribed}
          />
        </div>

        {/* Description */}
        <div className="mt-4">
          <VideoDescription description={video.description} />
        </div>

        {/* Comments */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Comments</h2>
          <AddComment videoId={videoId} />
          <CommentList videoId={videoId} currentUserId={userInfo?._id} />
        </div>
      </div>

      {/* RIGHT SECTION (Top Videos Sidebar) */}
      <div className="w-full lg:w-[360px] space-y-4">
        <TopVideo />
      </div>
    </div>
  );
};

export default WatchPage;
