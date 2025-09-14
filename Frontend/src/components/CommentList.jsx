import React, { useState } from "react";
import {
  useGetVideoCommentsQuery,
  useDeleteCommentMutation,
  useUpdateCommentMutation,
} from "../redux/api/commentApiSlice";
import { Menu } from "@headlessui/react";
import { toast } from "react-toastify";
import { format } from "timeago.js";
import { Link } from "react-router-dom";

const CommentList = ({ videoId, currentUserId }) => {
  const { data, isLoading } = useGetVideoCommentsQuery(videoId);
  const [deleteComment] = useDeleteCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [editingId, setEditingId] = useState(null);
  const [newContent, setNewContent] = useState("");

  if (isLoading) return <p className="text-gray-400">Loading comments...</p>;

  const comments = data?.data || [];

  const handleDelete = async (commentId) => {
    try {
      await deleteComment({ videoId, commentId }).unwrap();
      toast.success("Comment deleted");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleUpdate = async (commentId) => {
    try {
      await updateComment({ videoId, commentId, content: newContent }).unwrap();
      setEditingId(null);
      setNewContent("");
      toast.success("Comment updated");
    } catch (error) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="space-y-6 mt-2 max-w-[76%]">
      {comments.length === 0 && (
        <p className="text-gray-400">No comments yet. Be the first to comment!</p>
      )}

      {comments.map((c) => (
        <div key={c._id} className="flex items-start gap-3">
          {/* Avatar → Clickable */}
          <Link to={`/user-channel/${c.ownerInfo?.username}`}>
            <img
              src={c.ownerInfo?.avatar || "/default-avatar.png"}
              alt="avatar"
              className="w-10 h-10 rounded-full hover:opacity-80 transition"
            />
          </Link>

          {/* Comment body */}
          <div className="flex-1">
            {/* Top row: username + time + menu */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link
                  to={`/user-channel/${c.ownerInfo?.username}`}
                  className="text-white font-medium hover:underline"
                >
                  {c.ownerInfo?.fullname}
                </Link>
                <span className="text-xs text-gray-400">
                  {format(c.createdAt)}
                </span>
              </div>

              {c.ownerInfo?._id === currentUserId && (
                <Menu as="div" className="relative inline-block text-left">
                  <Menu.Button className="text-gray-400 hover:text-white">
                    ⋮
                  </Menu.Button>
                  <Menu.Items className="absolute right-0 mt-2 w-32 bg-gray-800 rounded-lg shadow-lg p-1 z-10">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            setEditingId(c._id);
                            setNewContent(c.content || c.text);
                          }}
                          className={`${
                            active ? "bg-gray-700" : ""
                          } block w-full text-left px-2 py-1 text-sm text-white`}
                        >
                          Edit
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleDelete(c._id)}
                          className={`${
                            active ? "bg-red-600" : ""
                          } block w-full text-left px-2 py-1 text-sm text-white`}
                        >
                          Delete
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Menu>
              )}
            </div>

            {/* Comment text */}
            {editingId === c._id ? (
              <div className="mt-2 flex gap-2">
                <input
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="flex-1 bg-gray-800 text-white rounded-lg px-2 py-1"
                />
                <button
                  onClick={() => handleUpdate(c._id)}
                  className="px-3 py-1 bg-green-600 rounded-lg text-white hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            ) : (
              <p className="text-gray-200 mt-1">{c.content || c.text}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;
