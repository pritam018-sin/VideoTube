import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout, updateAccessToken } from "../feature/auth/authSlice";
import { BASE_URL } from "../../redux/constants";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include", // send cookies (refresh cookie) if backend uses httpOnly cookies
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  // first try
  let result = await baseQuery(args, api, extraOptions);

  // if 401 -> try refresh
  if (result?.error && result.error.status === 401) {
    try {
      // call refresh endpoint (send cookie or refresh token in body)
      const refreshResult = await baseQuery(
        {
          url: "/api/v1/users/refresh-token",
          method: "POST",
          body:{
            refreshToken: api.getState().auth.refreshToken
          }
        },
        api,
        extraOptions
      );
      const refreshedData = refreshResult?.data?.data || refreshResult?.data?.message;
      const newAccessToken = refreshedData?.accessToken;

      if (newAccessToken) {
        api.dispatch(updateAccessToken(newAccessToken));
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } catch (error) {
      api.dispatch(logout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Videos", "Channels", "Subscription", "Comment", "Playlist", "Tweet"],
  endpoints: () => ({}),
});
