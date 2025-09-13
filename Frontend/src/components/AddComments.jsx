import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useAddCommentMutation } from "../redux/api/commentApiSlice";
import { toast } from "react-toastify";

const AddComment = ({ videoId }) => {
  const [content, setContent] = useState("");
  const { userInfo } = useSelector((state) => state.auth);
  const [addComment, { isLoading }] = useAddCommentMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await addComment({ videoId, content }).unwrap();
      setContent("");
      toast.success("Comment added");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment");
    }
  };

  return (
    <div className="flex items-start gap-3 py-4 border-b border-gray-800">
      {/* User Avatar */}
      <img
        src={userInfo?.avatar || "/default-avatar.png"}
        alt={userInfo?.username || "User"}
        className="w-10 h-10 rounded-full object-cover"
      />

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex-1">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-transparent border-b border-gray-700 focus:border-blue-500 outline-none text-white placeholder-gray-400 px-1 py-2 transition duration-200"
          placeholder="Add a comment..."
          disabled={isLoading}
        />

        {/* Action Buttons */}
        {content && (
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setContent("")}
              className="px-3 py-1 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700 transition"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 transition disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Posting..." : "Comment"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddComment;
