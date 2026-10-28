import React, { useState } from "react";
import {
  useGetAllTweetsQuery,
  useCreateTweetMutation,
  useUpdateTweetMutation,
  useToggleTweetLikeMutation,
} from "../redux/api/tweetApiSlice";
import { toast } from "react-toastify";
import { format } from "timeago.js";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import TweetUtils from "../components/TweetUtils";
import { ensureHttps } from "../utils/url.js";

const TweetsPage = () => {
  const [content, setContent] = useState("");
  const { data, isLoading, isError, refetch } = useGetAllTweetsQuery();
  const [createTweet, { isLoading: creating }] = useCreateTweetMutation();
  const [updateTweet] = useUpdateTweetMutation();
  const [toggleTweetLike] = useToggleTweetLikeMutation();

  // local state to track which tweet is being edited
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Tweet cannot be empty!");
      return;
    }

    try {
      await createTweet(content.trim()).unwrap();
      toast.success("Tweet posted!");
      setContent("");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create tweet");
    }
  };

  const handleUpdate = async (tweetId, content) => {
    try {
      await updateTweet({ tweetId, content: content.trim() }).unwrap();
      toast.success("Tweet updated!");
      setEditingId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update tweet");
    }
  };

  const handleLike = async (tweetId) => {
    try {
      await toggleTweetLike(tweetId).unwrap();
      refetch();
    } catch (err) {
      toast.error("Failed to like tweet");
    }
  };

  const handleShare = (tweetId) => {
    const url = `${window.location.origin}/tweets/${tweetId}`;
    navigator.clipboard.writeText(url);
    toast.success("Tweet link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24 text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mr-3" />
        Loading tweets...
      </div>
    );
  }

  const tweets = data?.data || [];

  return (
    <div className="max-w-4xl mx-auto mt-16 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-6 h-6 text-red-500" />
        <h1 className="text-2xl font-bold text-white tracking-wide">Community Tweets</h1>
      </div>

      {/* Create Tweet Form */}
      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-2xl bg-gradient-to-b from-gray-900/80 to-gray-950/80 border border-white/10 shadow-xl backdrop-blur-xl"
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening in your world?"
          className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none transition"
          rows={3}
        />
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
          <span className="text-xs text-gray-500">
            {content.length}/280 characters
          </span>
          <button
            type="submit"
            disabled={creating || !content.trim()}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-medium rounded-full shadow-lg shadow-red-600/20 disabled:opacity-50 transition cursor-pointer"
          >
            {creating ? "Posting..." : "Tweet"}
          </button>
        </div>
      </form>

      {/* Tweets Feed */}
      <div className="space-y-4">
        {tweets.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
            <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No tweets yet</p>
            <p className="text-sm text-gray-500 mt-1">Be the first to share an update with the community!</p>
          </div>
        ) : (
          tweets.map((tweet) => (
            <motion.div
              key={tweet._id}
              className="relative p-5 rounded-2xl bg-gray-900/60 border border-white/10 hover:border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Top: Avatar + User Info + Utils */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Link to={`/user-channel/${tweet?.owner?.username}`}>
                    <img
                      src={ensureHttps(tweet?.owner?.avatar) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                      alt="avatar"
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-white/10 hover:ring-red-500 transition"
                    />
                  </Link>
                  <div className="flex flex-col">
                    <Link
                      to={`/user-channel/${tweet?.owner?.username}`}
                      className="font-semibold text-white hover:text-red-400 transition"
                    >
                      {tweet?.owner?.fullname}
                    </Link>
                    <span className="text-gray-400 text-xs">
                      @{tweet?.owner?.username} · {format(tweet.createdAt)}
                    </span>
                  </div>
                </div>

                {/* 3-dot menu (only renders if owner) */}
                <TweetUtils
                  tweet={tweet}
                  onEdit={() => {
                    setEditingId(tweet._id);
                    setEditContent(tweet.content);
                  }}
                  onTweetDeleted={() => refetch()}
                />
              </div>

              {/* Tweet Content */}
              {editingId === tweet._id ? (
                <div className="mt-2 mb-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleUpdate(tweet._id, editContent)}
                      className="px-4 py-1.5 bg-green-600 rounded-lg hover:bg-green-500 transition text-white font-medium text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-1.5 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-gray-200 font-medium text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <Link to={`/tweets/${tweet._id}`}>
                  <p className="text-gray-200 text-base leading-relaxed mb-4 whitespace-pre-wrap hover:text-white transition">
                    {tweet.content}
                  </p>
                </Link>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-8 text-gray-400 pt-3 border-t border-white/5">
                <button
                  onClick={() => handleLike(tweet._id)}
                  className={`flex items-center gap-2 transition ${
                    tweet.isLiked ? "text-pink-500" : "hover:text-pink-500"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${tweet.isLiked ? "fill-pink-500 text-pink-500" : ""}`} />
                  <span className="text-xs font-semibold">{tweet.likesCount || 0}</span>
                </button>

                <Link
                  to={`/tweets/${tweet._id}`}
                  className="flex items-center gap-2 hover:text-blue-400 transition"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-xs font-semibold">Discussion</span>
                </Link>

                <button
                  onClick={() => handleShare(tweet._id)}
                  className="flex items-center gap-2 hover:text-green-400 transition"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-xs font-semibold">Share</span>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default TweetsPage;
