import React, { useState } from "react";
import { MoreVertical, Edit, Trash2, Check, X } from "lucide-react";
import { toast } from "react-toastify";
import {
  useUpdateTweetMutation,
  useDeleteTweetMutation,
} from "../redux/api/tweetApiSlice";

const TweetUtils = ({ tweet, onTweetUpdated, onTweetDeleted }) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newContent, setNewContent] = useState(tweet.content);

  const [updateTweet] = useUpdateTweetMutation();
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

  const handleSave = async () => {
    if (!newContent || newContent.trim() === "") return;

    try {
      await updateTweet({ id: tweet._id, content: newContent }).unwrap();
      toast.success("Tweet updated!");
      setEditing(false);
      onTweetUpdated && onTweetUpdated({ ...tweet, content: newContent });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update tweet");
    }
  };

  const handleCancel = () => {
    setNewContent(tweet.content);
    setEditing(false);
  };

  return (
    <div className="relative">
      {/* 3-dot button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-full hover:bg-white/10 transition"
      >
        <MoreVertical className="w-5 h-5 text-gray-400" />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-gray-900 border border-gray-800 rounded-xl shadow-lg z-50">
          <button
            onClick={() => {
              setEditing(true);
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

      {/* Inline edit field */}
      {editing && (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none"
          />
          <button
            onClick={handleSave}
            className="p-2 bg-green-600 rounded-lg hover:bg-green-500 transition"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-2 bg-red-600 rounded-lg hover:bg-red-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TweetUtils;
