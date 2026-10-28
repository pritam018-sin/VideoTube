import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetTweetQuery, useToggleTweetLikeMutation } from "../../redux/api/tweetApiSlice";
import { format } from "timeago.js";
import { Heart, MessageCircle, Share2, ArrowLeft } from "lucide-react";
import TweetUtils from "../../components/TweetUtils";
import { toast } from "react-toastify";

const SingleTweets = () => {
  const { tweetId } = useParams();
  const { data, isLoading, isError, refetch } = useGetTweetQuery(tweetId);
  const [toggleTweetLike] = useToggleTweetLikeMutation();

  const handleLike = async () => {
    try {
      await toggleTweetLike(tweetId).unwrap();
      refetch();
    } catch (err) {
      toast.error("Failed to like tweet");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Tweet link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24 text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mr-3" />
        Loading tweet...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center p-8 bg-red-950/20 border border-red-500/30 rounded-2xl text-red-400">
        <p className="font-semibold text-lg">Failed to load this tweet 😢</p>
        <Link to="/tweets" className="inline-block mt-4 text-sm text-blue-400 hover:underline">
          Back to all tweets
        </Link>
      </div>
    );
  }

  const tweet = data?.data;

  if (!tweet) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center text-gray-400">
        Tweet not found
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-20 px-4">
      <Link
        to="/tweets"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all tweets
      </Link>

      <div className="p-7 rounded-2xl bg-gray-900/70 border border-white/10 shadow-2xl backdrop-blur-xl">
        {/* Top: Avatar + User Info + TweetUtils */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <Link to={`/user-channel/${tweet?.owner?.username}`}>
              <img
                src={tweet?.owner?.avatar || "https://via.placeholder.com/150"}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10 hover:ring-red-500 transition"
              />
            </Link>
            <div className="flex flex-col">
              <Link
                to={`/user-channel/${tweet?.owner?.username}`}
                className="font-semibold text-white text-lg hover:text-red-400 transition"
              >
                {tweet?.owner?.fullname}
              </Link>
              <span className="text-gray-400 text-sm">
                @{tweet?.owner?.username} · {format(tweet.createdAt)}
              </span>
            </div>
          </div>

          <TweetUtils tweet={tweet} onTweetDeleted={() => window.history.back()} />
        </div>

        {/* Tweet Content */}
        <p className="text-gray-100 text-lg leading-relaxed mb-6 whitespace-pre-wrap">
          {tweet.content}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-8 text-gray-400 pt-4 border-t border-white/10">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition cursor-pointer ${
              tweet.isLiked ? "text-pink-500" : "hover:text-pink-500"
            }`}
          >
            <Heart className={`w-5 h-5 ${tweet.isLiked ? "fill-pink-500 text-pink-500" : ""}`} />
            <span className="text-sm font-semibold">{tweet.likesCount || 0}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 hover:text-green-400 transition cursor-pointer"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-semibold">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleTweets;

