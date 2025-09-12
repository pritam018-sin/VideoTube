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
      })
    }),
    uploadThumbnail: builder.mutation({
      query: ({ videoId, formData }) => ({
        url: `${VIDEOS_URL}/update-thumbnail/${videoId}`,
        method: "PATCH",
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetUserVideosQuery,
  useGetVideoByIdQuery,
  useGetAllVideosQuery,
  useUploadVideoMutation,
} = videoApiSlice;
