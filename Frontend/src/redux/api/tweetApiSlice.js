import { apiSlice } from "./apiSlice";
import { TWEETS_URL } from "../constants";
import { get } from "mongoose";

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
                body: { content }
            })
        }),
        getTweet: builder.query({
            query: (tweetId) => ({
                url: `${TWEETS_URL}/${tweetId}`,
                method: "GET",
            })
        }),
        updateTweet: builder.mutation({
            query: (content, tweetId) => ({
                url: `${TWEETS_URL}/update-tweet/${tweetId}`,
                method: "PUT",
                body: {content}
            })
        }),
        deleteTweet: builder.mutation({
            query: (tweetId) => ({
                url: `${TWEETS_URL}/delete-tweet/${tweetId}`,
                method: "DELETE"
            })
        })
    })
})

export const { 
    useGetUserTweetsQuery,
    useGetAllTweetsQuery,
    useCreateTweetMutation,
    useGetTweetQuery,
    useUpdateTweetMutation,
    useDeleteTweetMutation
 } = tweetApiSlice;