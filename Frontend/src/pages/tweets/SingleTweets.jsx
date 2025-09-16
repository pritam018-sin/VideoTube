import React from "react";
import { useParams } from "react-router-dom";
import { useGetTweetQuery } from "../../redux/api/tweetApiSlice";
import { format } from "timeago.js";
import { Heart, MessageCircle, Share2 } from "lucide-react";
// import TweetUtils from "../../components/TweetUtils";

const SingleTweets = () => {
  const { tweetId } = useParams(); // ✅ tweetId from URL
  const { data, isLoading, isError } = useGetTweetQuery(tweetId);

  if (isLoading) {
    return <div className="text-gray-400 mt-10">Loading tweet...</div>;
  }

  if (isError) {
    return (
      <div className="text-red-400 mt-10">Failed to load this tweet 😢</div>
    );
  }

  const tweet = data?.data;
  console.log(tweet)

  if (!tweet) {
    return <div className="text-gray-400 mt-10">Tweet not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto mt-15 p-6 rounded-2xl bg-white/5 border border-gray-800 shadow-md">
      {/* Top: Avatar + User Info */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={tweet?.owner?.avatar}
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-white text-lg">
            {tweet?.owner?.fullname}
          </span>
          <span className="text-gray-400 text-sm">
            @{tweet?.owner?.username} · {format(tweet.createdAt)}
          </span>
        </div>
      </div>

      {/* Tweet Content */}
      <p className="text-gray-200 text-lg leading-relaxed mb-4">
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
      {/* <TweetUtils tweet={tweet} /> */}
    </div>
  );
};

export default SingleTweets;

