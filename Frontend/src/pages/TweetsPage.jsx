import React, { useState } from "react";
import {
  useGetAllTweetsQuery,
  useCreateTweetMutation,
  useUpdateTweetMutation,
  useDeleteTweetMutation,
} from "../redux/api/tweetApiSlice";
import { toast } from "react-toastify";
import { format } from "timeago.js";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import TweetUtils from "../components/TweetUtils"; // 👈 import it

const TweetsPage = () => {
  const [content, setContent] = useState("");
  const { data, isLoading, isError, refetch } = useGetAllTweetsQuery();
  const [createTweet, { isLoading: creating }] = useCreateTweetMutation();
  const [updateTweet] = useUpdateTweetMutation();
  const [deleteTweet] = useDeleteTweetMutation();

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
      await createTweet(content).unwrap();
      toast.success("Tweet posted!");
      setContent("");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create tweet");
    }
  };

  const handleUpdate = async (tweetId, content) => {
    try {
      await updateTweet({ tweetId, content }).unwrap();
      toast.success("Tweet updated!");
      setEditingId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update tweet");
    }
  };

  if (isLoading) return <div className="text-gray-400">Loading tweets...</div>;
  if (isError) {
    toast.error("Failed to fetch tweets");
    return <div className="text-red-400">Error fetching tweets</div>;
  }

  const tweets = data?.data || [];

  return (
    <div className="max-w-6xl mx-auto mt-15 space-y-6">
      {/* ✅ Create Tweet Form */}
      <form
        onSubmit={handleSubmit}
        className="p-4 rounded-2xl bg-gray-900/50 border border-gray-800 shadow-md"
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          className="w-full p-3 bg-transparent border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          rows={3}
        />
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
          >
            {creating ? "Posting..." : "Tweet"}
          </button>
        </div>
      </form>

      {/* ✅ Tweets Feed */}
      <div className="space-y-4">
        {tweets.map((tweet) => (
          <motion.div
            key={tweet._id}
            className="relative p-4 rounded-2xl bg-white/5 border border-gray-800 hover:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Top: Avatar + User Info + Utils */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <img
                  src={tweet?.owner?.avatar}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-white">
                    {tweet?.owner?.fullname}
                  </span>
                  <span className="text-gray-400 text-sm">
                    @{tweet?.owner?.username} · {format(tweet.createdAt)}
                  </span>
                </div>
              </div>

              {/* 👇 3-dot menu */}
              <TweetUtils
                tweet={tweet}
                onEdit={() => {
                  setEditingId(tweet._id);
                  setEditContent(tweet.content);
                }}
                onTweetDeleted={() => refetch()} // 👈 only refetch here
              />
            </div>

            {/* Tweet Content (Editable) */}
            {editingId === tweet._id ? (
              <div className="mt-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleUpdate(tweet._id, editContent)}
                    className="px-3 py-1 bg-green-600 rounded-lg hover:bg-green-500 transition text-white"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 bg-red-600 rounded-lg hover:bg-red-500 transition text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <Link to={`/tweets/${tweet._id}`}>
                <p className="text-gray-200 text-base leading-relaxed mb-3">
                  {tweet.content}
                </p>
              </Link>
            )}

            {/* ✅ Action Buttons */}
            <div className="flex items-center gap-8 text-gray-400 mt-3">
              <button className="flex items-center gap-2 hover:text-pink-500 transition">
                <Heart className="w-5 h-5" />
                <span className="text-sm">Like</span>
              </button>
              <button className="flex items-center gap-2 hover:text-blue-500 transition">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">Comment</span>
              </button>
              <button className="flex items-center gap-2 hover:text-green-500 transition">
                <Share2 className="w-5 h-5" />
                <span className="text-sm">Share</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TweetsPage;
