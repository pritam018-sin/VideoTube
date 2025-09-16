import React from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useGetUserTweetsQuery } from "../redux/api/tweetApiSlice.js";
import { format } from "timeago.js";
import { Heart, MessageCircle, Share2 } from "lucide-react"; // ✅ icons

const TweetsTab = ({ userId }) => {
  const { data, isLoading, isError } = useGetUserTweetsQuery(userId);

  if (isLoading) return <div className="text-gray-400">Loading tweets...</div>;

  if (isError) {
    toast.error("Failed to fetch tweets");
    return <div className="text-red-400">Error fetching tweets</div>;
  }

  const tweets = data?.data || [];

  return (
    <div className="space-y-4">
      {tweets.map((tweet) => (
        <motion.div
          key={tweet._id}
          className="p-4 rounded-2xl bg-white/5 border border-gray-800 hover:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {/* Top: Avatar + Name + Time */}
          <div className="flex items-center gap-3 mb-2">
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

          {/* Content */}
          <p className="text-gray-200 text-base leading-relaxed mb-3">
            {tweet.content}
          </p>

          {/* ✅ Action Buttons */}
          <div className="flex items-center gap-8 text-gray-400">
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
  );
};

export default TweetsTab;
