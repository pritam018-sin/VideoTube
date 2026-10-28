import React, { useState } from "react";
import {
  useGetAllTweetsQuery,
  useCreateTweetMutation,
  useUpdateTweetMutation,
  useToggleTweetLikeMutation,
} from "../redux/api/tweetApiSlice";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { format } from "timeago.js";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Sparkles, Send, LogIn, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import TweetUtils from "../components/TweetUtils";
import { ensureHttps } from "../utils/url.js";

const TweetsPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
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
    if (!userInfo) {
      toast.info("Please login to share a tweet");
      return;
    }
    if (!content.trim()) {
      toast.error("Tweet cannot be empty!");
      return;
    }

    try {
      await createTweet(content.trim()).unwrap();
      toast.success("Tweet posted to community!");
      setContent("");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create tweet");
    }
  };

  const handleUpdate = async (tweetId, newContent) => {
    if (!newContent.trim()) {
      toast.error("Tweet cannot be empty");
      return;
    }
    try {
      await updateTweet({ tweetId, content: newContent.trim() }).unwrap();
      toast.success("Tweet updated!");
      setEditingId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update tweet");
    }
  };

  const handleLike = async (tweetId) => {
    if (!userInfo) {
      toast.info("Please login to like tweets");
      return;
    }
    try {
      await toggleTweetLike(tweetId).unwrap();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to like tweet");
    }
  };

  const handleShare = (tweetId) => {
    const url = `${window.location.origin}/tweets/${tweetId}`;
    navigator.clipboard.writeText(url);
    toast.success("Tweet link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-28 flex flex-col justify-center items-center text-gray-400">
        <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Loading community discussions...</p>
      </div>
    );
  }

  const tweets = data?.data || [];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:pl-20 max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-500/10 text-red-500 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Community Discussion</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Join conversations, share updates, and discuss with creators & viewers
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-full self-start sm:self-auto border border-white/5">
          <MessageCircle className="w-3.5 h-3.5 text-red-400" />
          <span>{tweets.length} {tweets.length === 1 ? "Discussion" : "Discussions"}</span>
        </div>
      </div>

      {/* Create Tweet Section / Login Invitation */}
      {userInfo ? (
        <form
          onSubmit={handleSubmit}
          className="p-5 rounded-2xl bg-gradient-to-b from-gray-900/90 to-gray-950/90 border border-white/10 shadow-xl backdrop-blur-xl transition hover:border-white/15"
        >
          <div className="flex gap-3">
            <img
              src={ensureHttps(userInfo.avatar) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt="your avatar"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10 shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Share your thoughts with the community..."
                className="w-full p-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none transition text-sm leading-relaxed"
                rows={3}
                maxLength={300}
              />
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                <span className="text-xs text-gray-500">
                  {content.length}/300 characters
                </span>
                <button
                  type="submit"
                  disabled={creating || !content.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-medium text-sm rounded-full shadow-lg shadow-red-600/20 disabled:opacity-50 transition cursor-pointer flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Tweet</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950/30 to-purple-950/30 border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xl">
          <div>
            <h3 className="text-white font-semibold text-base">Join the Discussion</h3>
            <p className="text-gray-400 text-xs mt-1">Sign in to share your thoughts, like community posts, and engage with others.</p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-red-600/20 self-start sm:self-auto shrink-0"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </Link>
        </div>
      )}

      {/* Tweets Feed */}
      <div className="space-y-4">
        {tweets.length === 0 ? (
          <div className="text-center py-16 bg-white/[0.02] border border-white/10 rounded-2xl">
            <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-300 font-medium">No discussions yet</p>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              Be the first to share an update or start a conversation with the community!
            </p>
          </div>
        ) : (
          tweets.map((tweet) => (
            <motion.div
              key={tweet._id}
              className="relative p-5 rounded-2xl bg-gray-900/70 border border-white/10 hover:border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-md"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Top: Avatar + User Info + Utils */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <Link to={`/user-channel/${tweet?.owner?.username}`}>
                    <img
                      src={ensureHttps(tweet?.owner?.avatar) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                      alt={tweet?.owner?.username || "user"}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10 hover:ring-red-500 transition"
                    />
                  </Link>
                  <div className="flex flex-col">
                    <Link
                      to={`/user-channel/${tweet?.owner?.username}`}
                      className="font-semibold text-white text-sm hover:text-red-400 transition"
                    >
                      {tweet?.owner?.fullname || tweet?.owner?.username || "Community Member"}
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
                    className="w-full p-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleUpdate(tweet._id, editContent)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 rounded-lg hover:bg-green-500 transition text-white font-medium text-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-gray-300 font-medium text-xs cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <Link to={`/tweets/${tweet._id}`}>
                  <p className="text-gray-200 text-sm sm:text-base leading-relaxed mb-4 whitespace-pre-wrap hover:text-white transition">
                    {tweet.content}
                  </p>
                </Link>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-6 sm:gap-8 text-gray-400 pt-3 border-t border-white/5">
                {/* Like Button */}
                <button
                  onClick={() => handleLike(tweet._id)}
                  className={`flex items-center gap-1.5 transition cursor-pointer group ${
                    tweet.isLiked ? "text-pink-500" : "hover:text-pink-500"
                  }`}
                  title={tweet.isLiked ? "Unlike tweet" : "Like tweet"}
                >
                  <Heart
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      tweet.isLiked ? "fill-pink-500 text-pink-500" : ""
                    }`}
                  />
                  <span className="text-xs font-semibold">{tweet.likesCount || 0}</span>
                </button>

                {/* Discussion Link */}
                <Link
                  to={`/tweets/${tweet._id}`}
                  className="flex items-center gap-1.5 hover:text-blue-400 transition group"
                  title="View discussion thread"
                >
                  <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-semibold">Discussion</span>
                </Link>

                {/* Share Link */}
                <button
                  onClick={() => handleShare(tweet._id)}
                  className="flex items-center gap-1.5 hover:text-green-400 transition group cursor-pointer"
                  title="Copy share link"
                >
                  <Share2 className="w-4 h-4 transition-transform group-hover:scale-110" />
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
