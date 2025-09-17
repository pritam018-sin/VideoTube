import { apiSlice } from "./apiSlice";
import { VIDEOS_URL } from "../constants";

export const videoApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllVideos: builder.query({
      query: () => `${VIDEOS_URL}/all-videos`,
    }),
    getUserVideos: builder.query({
      query: (userId) => `${VIDEOS_URL}/user-videos/${userId}`,
    }),
    getVideoById: builder.query({
      query: (videoId) => `${VIDEOS_URL}/${videoId}`,
    }),
    uploadVideo: builder.mutation({
      query: (formData) => ({
        url: `${VIDEOS_URL}/upload-content`,
        method: "POST",
        body: formData,
      }),
    }),
    uploadThumbnail: builder.mutation({
      query: ({ videoId, formData }) => ({
        url: `${VIDEOS_URL}/update-thumbnail/${videoId}`,
        method: "PATCH",
        body: formData,
      }),
    }),
    updateVideoDetails: builder.mutation({
      query: ({ videoId, details }) => ({
        url: `${VIDEOS_URL}/update-video/${videoId}`,
        method: "PUT",
        body: details,
      }),
      invalidatesTags: ["Video"],
    }),
    updateThumbnail: builder.mutation({
      query: ({ videoId, formData }) => ({
        url: `${VIDEOS_URL}/update-thumbnail/${videoId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Video"],
    }),
    togglePublish: builder.mutation({
      query: (videoId) => ({
        url: `${VIDEOS_URL}/toggle-publish/${videoId}`,
        method: "PUT",
      }),
      invalidatesTags: ["Video"],
    }),
    deleteVideo: builder.mutation({
      query: (videoId) => ({
        url: `${VIDEOS_URL}/delete-video/${videoId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Video"],
    }),
    getMyVideos: builder.query({
      query: (userId) => `${VIDEOS_URL}/${userId}/my-videos`,
      providesTags: ["Video"],
    }),
    searchVideos: builder.query({
      query: (q) => ({
        url: `${VIDEOS_URL}/search?query=${q}`,
        method: "GET"
      }),
      providesTags: ["Video"]

    }),
    topVideos: builder.query({
      query: () => `${VIDEOS_URL}/top`,
      method: "GET"
    }),
    
  }),
});

export const {
  useGetUserVideosQuery,
  useGetVideoByIdQuery,
  useGetAllVideosQuery,
  useUploadVideoMutation,
  useUpdateVideoDetailsMutation,
  useUpdateThumbnailMutation,
  useTogglePublishMutation,
  useDeleteVideoMutation,
  useGetMyVideosQuery,
  useSearchVideosQuery,
  useTopVideosQuery,
} = videoApiSlice;
