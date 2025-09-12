import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  useGetMyVideosQuery,
  useDeleteVideoMutation,
  useUpdateVideoDetailsMutation,
  useUpdateThumbnailMutation,
  useTogglePublishMutation,
} from "../../redux/api/videoApiSlice";
import { toast } from "react-toastify";

const UserDashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const userId = userInfo?._id;

  const { data: videos, isLoading, error } = useGetMyVideosQuery(userId);
  const [deleteVideo] = useDeleteVideoMutation();
  const [updateVideoDetails] = useUpdateVideoDetailsMutation();
  const [updateThumbnail] = useUpdateThumbnailMutation();
  const [togglePublish] = useTogglePublishMutation();

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });

  // ✅ Delete
  const handleDelete = async (id) => {
    try {
      await deleteVideo(id).unwrap();
      toast.success("Video deleted");
    } catch (err) {
      toast.error("Delete failed");
      console.error(err);
    }
  };

  // ✅ Update details
  const handleUpdateDetails = async (id) => {
    try {
      await updateVideoDetails({
        videoId: id,
        details: { title: editForm.title, description: editForm.description },
      }).unwrap();
      toast.success("Video updated");
      setEditId(null);
    } catch (err) {
      toast.error("Update failed");
      console.error(err);
    }
  };

  // ✅ Update thumbnail
  const handleUpdateThumbnail = async (id, file) => {
    const formData = new FormData();
    formData.append("thumbnail", file);

    try {
      await updateThumbnail({ videoId: id, formData }).unwrap();
      toast.success("Thumbnail updated");
    } catch (err) {
      toast.error("Thumbnail update failed");
      console.error(err);
    }
  };

  // ✅ Toggle Publish/Unpublish
  const handleTogglePublish = async (id) => {
    try {
      await togglePublish(id).unwrap();
      toast.success("Publish status updated");
    } catch (err) {
      toast.error("Failed to toggle publish");
      console.error(err);
    }
  };

  // ⏳ Loading & Error
  if (isLoading)
    return <p className="text-gray-400 text-center mt-10">Loading your videos...</p>;
  if (error)
    return <p className="text-red-500 text-center mt-10">Failed to load videos</p>;

  return (
    <div className="p-6 text-white min-h-screen ml-12 max-w-7xl mx-auto">
      <h2 className="mt-10 text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
        🎬 My Dashboard
      </h2>

      {videos.data?.length === 0 && (
        <p className="text-center text-gray-400">No videos uploaded yet.</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.data?.map((video) => (
          <div
            key={video._id}
            className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-5 hover:scale-[1.02] transition-transform duration-300"
          >
            <img
              src={video.thumbnail}
              alt="thumbnail"
              className="w-full h-40 object-cover rounded-xl shadow-md"
            />

            {editId === video._id ? (
              <div className="mt-4">
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  placeholder="New Title"
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white outline-none mb-2"
                />
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  placeholder="New Description"
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white outline-none mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateDetails(video._id)}
                    className="flex-1 px-3 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditId(null)}
                    className="flex-1 px-3 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold mt-3">{video.title}</h3>
                <p className="text-sm text-gray-300 line-clamp-2">
                  {video.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Uploaded:{" "}
                  {new Date(video.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs mt-1">
                  Status:{" "}
                  <span
                    className={
                      video.isPublished ? "text-green-400" : "text-yellow-400"
                    }
                  >
                    {video.isPublished ? "Published" : "Unpublished"}
                  </span>
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => {
                      setEditId(video._id);
                      setEditForm({
                        title: video.title,
                        description: video.description,
                      });
                    }}
                    className="flex-1 px-3 py-1 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                  >
                    ✏️ Edit
                  </button>

                  <label className="flex-1 px-3 py-1 bg-purple-600 rounded-lg hover:bg-purple-700 cursor-pointer text-center transition">
                    📷 Thumbnail
                    <input
                      type="file"
                      hidden
                      onChange={(e) =>
                        handleUpdateThumbnail(video._id, e.target.files[0])
                      }
                    />
                  </label>

                  <button
                    onClick={() => handleTogglePublish(video._id)}
                    className="flex-1 px-3 py-1 bg-yellow-600 rounded-lg hover:bg-yellow-700 transition"
                  >
                    {video.isPublished ? "Unpublish" : "Publish"}
                  </button>

                  <button
                    onClick={() => handleDelete(video._id)}
                    className="flex-1 px-3 py-1 bg-red-600 rounded-lg hover:bg-red-700 transition"
                  >
                    🗑 Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
