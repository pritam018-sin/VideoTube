import { apiSlice } from "./apiSlice";
import { USERS_URL } from "../constants";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (payload) => ({
        url: `${USERS_URL}/login`,
        method: "POST",
        body: payload,
      }),
    }),
    register: builder.mutation({
      // multipart form (avatar + cover) required by your register route
      query: (formData) => ({
        url: `${USERS_URL}/register`,
        method: "POST",
        // leave body as formData, RTK Query will send correct headers
        body: formData,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
      }),
    }),
    getCurrentUser: builder.query({
      query: () => ({
        url: `${USERS_URL}/current-user`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    updateAccountDetails: builder.mutation({
      query: (userData) => ({
        url: `${USERS_URL}/update-account-details`,
        method: "PATCH",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    updateAvatar: builder.mutation({
      query: (formData) => ({
        url: `${USERS_URL}/update-avatar`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
    updateCover: builder.mutation({
      query: (formData) => ({
        url: `${USERS_URL}/update-cover-image`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
    getUserChannelProfile: builder.query({
      query: (username) => ({
        url: `${USERS_URL}/channel/${username}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    addToWatchHistory: builder.mutation({
      query: (videoId) => ({
        url: `${USERS_URL}/watch-history`,
        method: "POST",
        body: { videoId },
      }),
    }),

    watchHistory: builder.query({
      query: () => ({
        url: `${USERS_URL}/watch-history`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useUpdateAccountDetailsMutation,
  useUpdateAvatarMutation,
  useUpdateCoverMutation,
  useGetUserChannelProfileQuery,
  useWatchHistoryQuery,
  useAddToWatchHistoryMutation,
} = userApiSlice;
