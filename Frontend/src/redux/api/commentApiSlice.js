import { apiSlice } from "./apiSlice";
import { COMMENTS_URL } from "../constants";

export const commentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getVideoComments: builder.query({
      query: (videoId) => `${COMMENTS_URL}/${videoId}/video-comments`,
      providesTags: (result, error, videoId) => [{ type: "Comment", id: videoId }],
    }),
    addComment: builder.mutation({
      query: ({ videoId, content }) => ({
        url: `${COMMENTS_URL}/${videoId}/comment`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: (result, error, { videoId }) => [
        { type: "Comment", id: videoId },
      ],
    }),
    updateComment: builder.mutation({
      query: ({ videoId, commentId, content }) => ({
        url: `${COMMENTS_URL}/${videoId}/comments/${commentId}`,
        method: "PUT",
        body: { content },
      }),
      invalidatesTags: ["Comment"],
    }),
    deleteComment: builder.mutation({
      query: ({ videoId, commentId }) => ({
        url: `${COMMENTS_URL}/${videoId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { videoId }) => [
        { type: "Comment", id: videoId },
      ],
    }),
  }),
});

export const {
  useGetVideoCommentsQuery,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentApiSlice;