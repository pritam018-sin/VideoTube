import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetUserChannelProfileQuery } from "../../redux/api/userApiSlice.js";
import { motion } from "framer-motion";
import { FaUserPlus, FaUserMinus } from "react-icons/fa";
import Button from "../../components/Button.jsx";
import Subscription from "../../components/Subscription.jsx";

// Tabs Components
import VideosTab from "../../components/VideosTab.jsx";
import PlaylistsTab from "../../components/PlaylistsTab.jsx";
import TweetsTab from "../../components/TweetsTab.jsx";

const UserChannel = () => {
  const { username } = useParams();
  const { data: channelData, isLoading, error } =
    useGetUserChannelProfileQuery(username);
  const [activeTab, setActiveTab] = useState("Videos");

  if (isLoading) return <div className="text-white mt-20">Loading...</div>;
  if (error) return <div className="text-red-500 mt-20">Error loading channel data</div>;

  const channel = channelData?.data;
  // console.log(channel);


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Banner */}
      <div className="relative w-full h-52 md:h-72 rounded-b-2xl shadow-lg">
        {channel?.coverImage ? (
          <img
            src={channel.coverImage}
            alt={channel.fullname}
            className="pl-10 w-[95%] mx-auto h-full object-cover rounded-2xl rounded-l-2xl shadow-lg"
          />
        ) : (
          <div className="w-full h-full bg-gray-800" />
        )}
      </div>

      {/* Channel Info */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 flex flex-col md:flex-row items-center md:items-end gap-6">
        {/* Avatar */}
        <motion.img
          src={channel?.avatar}
          alt={channel?.fullname}
          className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Text Info */}
        <div className="flex-1 mt-30">
          <h1 className="text-2xl md:text-3xl font-bold">{channel?.fullname}</h1>
          <p className="text-gray-400">@{channel?.username}</p>
          <p className="mt-1 text-gray-300 max-w-xl">{channel?.description}</p>

          <div className="flex gap-4 mt-3 text-sm text-gray-400">
            <span>{channel?.subscribersCount} Subscribers</span>
            <span>{channel?.channelSubscribedToCount} Subscribed</span>
          </div>
        </div>

        {/* Subscribe Button */}
        <Subscription channelId={channel._id} isSubscribed={channel.isSubscribed} />
      </div>

      {/* Divider */}
      <div className="border-b border-gray-700 mt-6" />

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex gap-6 text-gray-400 font-medium">
          {["Videos", "Playlists", "Tweets"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 transition ${
                activeTab === tab
                  ? "text-red-500 border-b-2 border-red-500"
                  : "hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
           {activeTab === "Videos" && <VideosTab userId={channel?._id} />}
           {activeTab === "Playlists" && <PlaylistsTab userId={channel?._id} />}
           {activeTab === "Tweets" && <TweetsTab userId={channel?._id} />}
        </div>
      </div>
    </div>
  );
};

export default UserChannel;
