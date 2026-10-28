import { apiSlice } from "./apiSlice";
import { TWEETS_URL } from "../constants";

export const tweetApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserTweets: builder.query({
      query: (userId) => ({
        url: `${TWEETS_URL}/user-tweets/${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, userId) => [{ type: "Tweet", id: userId }],
    }),
    getAllTweets: builder.query({
      query: () => ({
        url: `${TWEETS_URL}/all-tweets`,
        method: "GET",
      }),
      providesTags: ["Tweet"],
    }),
    createTweet: builder.mutation({
      query: (content) => ({
        url: `${TWEETS_URL}/create-tweet`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: ["Tweet"],
    }),
    getTweet: builder.query({
      query: (tweetId) => ({
        url: `${TWEETS_URL}/${tweetId}`,
        method: "GET",
      }),
      providesTags: (result, error, tweetId) => [{ type: "Tweet", id: tweetId }, "Tweet"],
    }),
    updateTweet: builder.mutation({
      query: ({ tweetId, content }) => ({
        url: `${TWEETS_URL}/update-tweet/${tweetId}`,
        method: "PUT",
        body: { content },
      }),
      invalidatesTags: ["Tweet"],
    }),

    deleteTweet: builder.mutation({
      query: (tweetId) => ({
        url: `${TWEETS_URL}/delete-tweet/${tweetId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tweet"],
    }),
    toggleTweetLike: builder.mutation({
      query: (tweetId) => ({
        url: `${TWEETS_URL}/${tweetId}/like`,
        method: "POST",
      }),
      invalidatesTags: ["Tweet"],
    }),
  }),
});

export const {
  useGetUserTweetsQuery,
  useGetAllTweetsQuery,
  useCreateTweetMutation,
  useGetTweetQuery,
  useUpdateTweetMutation,
  useDeleteTweetMutation,
  useToggleTweetLikeMutation,
} = tweetApiSlice;
