import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  useGetUserTweetsQuery,
  useToggleTweetLikeMutation,
  useUpdateTweetMutation,
} from "../redux/api/tweetApiSlice.js";
import { format } from "timeago.js";
import { Heart, MessageCircle, Share2, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import TweetUtils from "./TweetUtils.jsx";

const TweetItem = ({ tweet, refetch }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const [toggleTweetLike, { isLoading: isLiking }] = useToggleTweetLikeMutation();
  const [updateTweet, { isLoading: isUpdating }] = useUpdateTweetMutation();

  const [isLiked, setIsLiked] = useState(tweet?.isLiked || false);
  const [likesCount, setLikesCount] = useState(tweet?.likesCount || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(tweet?.content || "");

  const handleLike = async () => {
    if (!userInfo) {
      toast.info("Please login to like tweets");
      return;
    }
    const prevLiked = isLiked;
    const prevCount = likesCount;

    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await toggleTweetLike(tweet._id).unwrap();
      if (res?.data) {
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likesCount);
      }
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error(err?.data?.message || "Failed to update like");
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/tweet/${tweet._id}`;
    navigator.clipboard.writeText(url);
    toast.success("Tweet link copied to clipboard!");
  };

  const handleSaveEdit = async () => {
    if (!editedContent.trim()) {
      toast.error("Tweet cannot be empty");
      return;
    }
    try {
      await updateTweet({ tweetId: tweet._id, content: editedContent.trim() }).unwrap();
      toast.success("Tweet updated successfully!");
      setIsEditing(false);
      refetch && refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update tweet");
    }
  };

  return (
    <motion.div
      key={tweet._id}
      className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 shadow-lg transition-all duration-300"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      {/* Top Header: Avatar + Author + Utils */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Link to={`/user-channel/${tweet?.owner?.username}`}>
            <img
              src={tweet?.owner?.avatar || "https://via.placeholder.com/150"}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10 hover:ring-pink-500 transition"
            />
          </Link>
          <div className="flex flex-col">
            <Link
              to={`/user-channel/${tweet?.owner?.username}`}
              className="font-semibold text-white text-sm hover:underline"
            >
              {tweet?.owner?.fullname || tweet?.owner?.username}
            </Link>
            <span className="text-gray-400 text-xs">
              @{tweet?.owner?.username} · {format(tweet.createdAt)}
            </span>
          </div>
        </div>

        {/* TweetUtils (Only owner sees this) */}
        <TweetUtils
          tweet={tweet}
          onEdit={() => setIsEditing(true)}
          onTweetDeleted={() => refetch && refetch()}
        />
      </div>

      {/* Content or Edit Mode */}
      {isEditing ? (
        <div className="mb-4 space-y-2">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-pink-500 resize-none"
            rows={3}
            autoFocus
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isUpdating}
              className="px-3.5 py-1.5 rounded-lg text-xs bg-pink-600 hover:bg-pink-500 text-white font-medium transition flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-200 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
          {tweet.content}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-6 text-gray-400 text-xs pt-2 border-t border-white/5">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-1.5 transition cursor-pointer ${
            isLiked ? "text-pink-500 font-semibold" : "hover:text-pink-400"
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-pink-500" : ""}`} />
          <span>{likesCount}</span>
        </button>

        <Link
          to={`/tweet/${tweet._id}`}
          className="flex items-center gap-1.5 hover:text-blue-400 transition"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Reply</span>
        </Link>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 hover:text-green-400 transition cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>
    </motion.div>
  );
};

const TweetsTab = ({ userId }) => {
  const { data, isLoading, isError, refetch } = useGetUserTweetsQuery(userId, {
    skip: !userId,
  });

  if (isLoading)
    return <div className="text-gray-400 text-center py-8">Loading tweets...</div>;

  if (isError) {
    return (
      <div className="text-red-400 text-center py-8">
        Failed to load tweets.
      </div>
    );
  }

  const tweets = data?.data || [];

  if (tweets.length === 0) {
    return (
      <div className="p-8 text-center bg-white/[0.02] border border-white/5 rounded-2xl">
        <p className="text-gray-400 text-sm">No tweets posted yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {tweets.map((tweet) => (
        <TweetItem key={tweet._id} tweet={tweet} refetch={refetch} />
      ))}
    </div>
  );
};

export default TweetsTab;
