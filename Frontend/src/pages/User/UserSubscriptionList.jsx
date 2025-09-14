import React from "react";
import { useSelector } from "react-redux";
import { useGetSubscriptionsQuery } from "../../redux/api/subscriptionApiSlice.js";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const UserSubscriptionList = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const {
    data: subscriptions,
    isLoading,
    isError,
  } = useGetSubscriptionsQuery(userInfo?._id, {
    skip: !userInfo?._id, // skip query if not logged in
  });

  // API expected structure => { data: { channels: [...] } }
  const channels = subscriptions?.data?.channels || [];

  if (isLoading)
    return <div className="text-gray-400 animate-pulse">Loading...</div>;
  if (isError)
    return <div className="text-red-500">Error loading subscriptions</div>;
  if (!channels.length)
    return <div className="text-gray-400">No subscriptions found</div>;

  return (
    <div className="space-y-3 mt-16 max-w-6xl mx-auto ">
      {channels.map((channel) => (
        <motion.div
          key={channel._id}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <Link
            to={`/user-channel/${channel.username}`}
            className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-gray-900/70 to-gray-800/60 
                       border border-gray-700/50 hover:border-red-500/60 
                       shadow-lg hover:shadow-red-500/10 transition-all duration-300"
          >
            <img
              src={channel.avatar}
              alt={channel.fullname}
              className="w-14 h-14 rounded-full object-cover border border-gray-600 hover:border-red-500 transition-colors"
            />
            <div>
              <h3 className="font-semibold text-white text-lg">
                {channel.fullname}
              </h3>
              <p className="text-sm text-gray-400">@{channel.username}</p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default UserSubscriptionList;
