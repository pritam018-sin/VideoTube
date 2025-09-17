import React, { useState } from "react";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useDeleteTweetMutation } from "../redux/api/tweetApiSlice";

const TweetUtils = ({ tweet, onEdit, onTweetDeleted }) => {
  const [open, setOpen] = useState(false);
  const [deleteTweet] = useDeleteTweetMutation();

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
        className="p-2 rounded-full hover:bg-white/10 transition"
      >
        <MoreVertical className="w-5 h-5 text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-gray-900 border border-gray-800 rounded-xl shadow-lg z-50">
          <button
            onClick={() => {
              onEdit(); // 👈 just trigger edit mode
              setOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2 w-full text-left text-gray-300 hover:bg-gray-800 rounded-t-xl"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Tweet</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 w-full text-left text-red-400 hover:bg-gray-800 rounded-b-xl"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Tweet</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TweetUtils;
