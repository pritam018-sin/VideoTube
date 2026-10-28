import React, { useState } from "react";
import {
  useGetVideoCommentsQuery,
  useDeleteCommentMutation,
  useUpdateCommentMutation,
  useToggleCommentLikeMutation,
  useAddCommentMutation,
} from "../redux/api/commentApiSlice";
import { Menu } from "@headlessui/react";
import { toast } from "react-toastify";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, CornerDownRight, Send, Trash2 } from "lucide-react";
import { ensureHttps } from "../utils/url.js";

const CommentList = ({ videoId, currentUserId }) => {
  const { data, isLoading, refetch } = useGetVideoCommentsQuery(videoId);
  const [deleteComment] = useDeleteCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [toggleCommentLike] = useToggleCommentLikeMutation();
  const [addComment, { isLoading: replying }] = useAddCommentMutation();

  const [editingId, setEditingId] = useState(null);
  const [newContent, setNewContent] = useState("");

  // Track which comment reply box is open
  const [replyingCommentId, setReplyingCommentId] = useState(null);
  const [replyText, setReplyText] = useState("");

  if (isLoading) return <p className="text-gray-400 py-4">Loading comments...</p>;

  const comments = data?.data || [];

  const handleDelete = async (commentId) => {
    try {
      await deleteComment({ videoId, commentId }).unwrap();
      toast.success("Comment deleted");
    } catch (error) {
      toast.error(error?.data?.message || "Delete failed");
    }
  };

  const handleUpdate = async (commentId) => {
    if (!newContent.trim()) return;
    try {
      await updateComment({ videoId, commentId, content: newContent.trim() }).unwrap();
      setEditingId(null);
      setNewContent("");
      toast.success("Comment updated");
    } catch (error) {
      toast.error(error?.data?.message || "Update failed");
    }
  };

  const handleLike = async (commentId) => {
    try {
      await toggleCommentLike(commentId).unwrap();
    } catch (error) {
      toast.error("Failed to like comment");
    }
  };

  const handleReplySubmit = async (commentId) => {
    if (!replyText.trim()) return;
    try {
      await addComment({
        videoId,
        content: replyText.trim(),
        parentComment: commentId,
      }).unwrap();
      toast.success("Reply added");
      setReplyText("");
      setReplyingCommentId(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to add reply");
    }
  };

  return (
    <div className="space-y-6 mt-4 max-w-3xl">
      {comments.length === 0 && (
        <div className="p-6 text-center bg-white/5 border border-white/10 rounded-2xl">
          <MessageSquare className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-400">No comments yet. Be the first to start the conversation!</p>
        </div>
      )}

      {comments.map((c) => (
        <div key={c._id} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <Link to={`/user-channel/${c.ownerInfo?.username}`}>
              <img
                src={ensureHttps(c.ownerInfo?.avatar) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10 hover:ring-red-500 transition"
              />
            </Link>

            {/* Comment Body */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/user-channel/${c.ownerInfo?.username}`}
                    className="text-white font-medium hover:text-red-400 text-sm transition"
                  >
                    {c.ownerInfo?.fullname || c.ownerInfo?.username}
                  </Link>
                  <span className="text-xs text-gray-500">
                    {format(c.createdAt)}
                  </span>
                </div>

                {/* Edit / Delete (Owner only) */}
                {String(c.ownerInfo?._id || "") === String(currentUserId || "") && (
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition">
                      ⋮
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 mt-1 w-28 bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-1 z-20 backdrop-blur-md">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => {
                              setEditingId(c._id);
                              setNewContent(c.content || c.text);
                            }}
                            className={`${
                              active ? "bg-white/10" : ""
                            } block w-full text-left px-3 py-1.5 text-xs text-white rounded-lg transition`}
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
                              active ? "bg-red-500/20" : ""
                            } block w-full text-left px-3 py-1.5 text-xs text-red-400 rounded-lg transition`}
                          >
                            Delete
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                )}
              </div>

              {/* Comment Content / Edit input */}
              {editingId === c._id ? (
                <div className="mt-2 flex gap-2">
                  <input
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleUpdate(c._id)}
                    className="px-3 py-1.5 bg-green-600 rounded-lg text-white hover:bg-green-500 text-xs font-medium transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 bg-gray-700 rounded-lg text-gray-300 hover:bg-gray-600 text-xs font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="text-gray-200 mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                  {c.content || c.text}
                </p>
              )}

              {/* Action row: Like + Reply Button */}
              <div className="flex items-center gap-4 mt-2.5 text-gray-400 text-xs">
                <button
                  onClick={() => handleLike(c._id)}
                  className={`flex items-center gap-1.5 transition cursor-pointer ${
                    c.isLiked ? "text-pink-500" : "hover:text-pink-500"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${c.isLiked ? "fill-pink-500 text-pink-500" : ""}`} />
                  <span className="font-semibold">{c.likesCount || 0}</span>
                </button>

                <button
                  onClick={() => {
                    setReplyingCommentId(replyingCommentId === c._id ? null : c._id);
                    setReplyText("");
                  }}
                  className="hover:text-white font-medium transition cursor-pointer"
                >
                  Reply
                </button>
              </div>

              {/* Inline Reply Input */}
              {replyingCommentId === c._id && (
                <div className="mt-3 flex items-center gap-2 pl-2 border-l-2 border-red-500">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 bg-gray-800/80 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <button
                    onClick={() => handleReplySubmit(c._id)}
                    disabled={replying || !replyText.trim()}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    Reply
                  </button>
                  <button
                    onClick={() => setReplyingCommentId(null)}
                    className="px-2.5 py-1.5 text-xs text-gray-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Nested Replies List */}
              {c.replies && c.replies.length > 0 && (
                <div className="mt-4 space-y-3 pl-4 border-l border-white/10">
                  <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    <CornerDownRight className="w-3 h-3" />
                    {c.replies.length} {c.replies.length === 1 ? "Reply" : "Replies"}
                  </span>

                  {c.replies.map((reply) => (
                    <div key={reply._id} className="flex items-start gap-2.5 group/reply">
                      <Link to={`/user-channel/${reply.ownerInfo?.username}`}>
                        <img
                          src={ensureHttps(reply.ownerInfo?.avatar) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                          alt="avatar"
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
                        />
                      </Link>
                      <div className="flex-1 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/user-channel/${reply.ownerInfo?.username}`}
                              className="text-white text-xs font-medium hover:text-red-400 transition"
                            >
                              {reply.ownerInfo?.fullname || reply.ownerInfo?.username}
                            </Link>
                            <span className="text-[10px] text-gray-500">
                              {format(reply.createdAt)}
                            </span>
                          </div>

                          {/* Delete reply if owner */}
                          {String(reply.ownerInfo?._id || "") === String(currentUserId || "") && (
                            <button
                              onClick={() => handleDelete(reply._id)}
                              className="opacity-0 group-hover/reply:opacity-100 text-gray-500 hover:text-red-400 text-[10px] transition"
                              title="Delete reply"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-gray-300 text-xs mt-1 whitespace-pre-wrap">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;
