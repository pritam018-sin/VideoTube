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
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
} = userApiSlice;
