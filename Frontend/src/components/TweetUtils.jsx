import React, { useState } from "react";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useDeleteTweetMutation } from "../redux/api/tweetApiSlice";
import { useSelector } from "react-redux";

const TweetUtils = ({ tweet, onEdit, onTweetDeleted }) => {
  const [open, setOpen] = useState(false);
  const [deleteTweet, { isLoading }] = useDeleteTweetMutation();
  const { userInfo } = useSelector((state) => state.auth);

  // Strict ownership check: only the tweet author sees edit/delete
  const ownerId = tweet?.owner?._id ? String(tweet.owner._id) : String(tweet?.owner || "");
  const currentUserId = String(userInfo?._id || "");
  if (!currentUserId || !ownerId || currentUserId !== ownerId) {
    return null;
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this tweet?")) return;
    try {
      await deleteTweet(tweet._id).unwrap();
      toast.success("Tweet deleted!");
      onTweetDeleted && onTweetDeleted(tweet._id);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete tweet");
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-full hover:bg-white/10 transition text-gray-400 hover:text-white"
        aria-label="Tweet options"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 backdrop-blur-md overflow-hidden">
          <button
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2.5 w-full text-left text-sm text-gray-300 hover:bg-white/10 transition"
          >
            <Edit className="w-4 h-4 text-blue-400" />
            <span>Edit Tweet</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 w-full text-left text-sm text-red-400 hover:bg-red-500/10 transition"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span>{isLoading ? "Deleting..." : "Delete Tweet"}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TweetUtils;
