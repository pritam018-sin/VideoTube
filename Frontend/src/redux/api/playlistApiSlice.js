import { apiSlice } from "./apiSlice.js";
import { PLAYLISTS_URL } from "../constants.js";

export const playlistApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserAllPlaylist: builder.query({
      query: (userId) => ({
        url: `${PLAYLISTS_URL}/${userId}/playlist`,
        method: "GET",
      }),
      providesTags: (result, error, userId) => [
        { type: "Playlist", id: userId },
      ],
    }),
    getSinglePlaylist: builder.query({
      query: (playlistId) => ({
        url: `${PLAYLISTS_URL}/${playlistId}`,
        method: "GET",
      }),
      providesTags: (result, error, playlistId) => [
        { type: "Playlist", id: playlistId },
      ],
    }),
    createPlaylist: builder.mutation({
      query: (data) => ({
        url: `${PLAYLISTS_URL}/`,
        method: "POST",
        body: data,
      }),
    }),
    updatePlaylist: builder.mutation({
      query: ({ playlistId, ...data }) => ({
        url: `${PLAYLISTS_URL}/${playlistId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { playlistId }) => [{ type: "Playlist", id: playlistId }],
    }),
    deletePlaylist: builder.mutation({
      query: (playlistId) => ({
        url: `${PLAYLISTS_URL}/${playlistId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Playlist"],
    }),
    addVideoToPlaylist: builder.mutation({
      query: ({ playlistId, videoId }) => ({
        url: `${PLAYLISTS_URL}/${playlistId}/videos/${videoId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { playlistId }) => [
        { type: "Playlist", id: playlistId },
      ],
    }),
    removeVideoFromPlaylist: builder.mutation({
      query: ({ playlistId, videoId }) => ({
        url: `${PLAYLISTS_URL}/${playlistId}/videos/${videoId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { playlistId }) => [
        { type: "Playlist", id: playlistId },
      ],
    }),
  }),
});

export const {
  useGetUserAllPlaylistQuery,
  useGetSinglePlaylistQuery,
  useCreatePlaylistMutation,
  useUpdatePlaylistMutation,
  useDeletePlaylistMutation,
  useAddVideoToPlaylistMutation,
  useRemoveVideoFromPlaylistMutation,
} = playlistApiSlice;
