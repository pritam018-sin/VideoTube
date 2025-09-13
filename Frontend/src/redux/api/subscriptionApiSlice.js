import { apiSlice } from "./apiSlice";
import { SUBSCRIPTIONS_URL } from "../constants";

export const subscriptionApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        subscribeToggle: builder.mutation({
            query: (channelId) => ({
                url: `${SUBSCRIPTIONS_URL}/${channelId}/subscribe`,
                method: "POST",
            }),
            invalidatesTags: (result, error, channelId) => [{ type: "Subscription", id: channelId }],
        })
    })
})

export const {
    useSubscribeToggleMutation,
} = subscriptionApiSlice;