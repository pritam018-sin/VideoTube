import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSubscribeToggleMutation } from "../redux/api/subscriptionApiSlice";

const Subscription = ({ channelId, isSubscribed: initialSubscribed }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [subscribeToggle, { isLoading }] = useSubscribeToggleMutation();

  const [subscribed, setSubscribed] = useState(initialSubscribed);

  useEffect(() => {
    setSubscribed(initialSubscribed);
  }, [initialSubscribed]);

  const handleSubscribe = async () => {
    if (!userInfo) {
      navigate("/login");
      return;
    }

    // prevent subscribing to own channel
    if (userInfo._id === channelId) return;

    try {
      await subscribeToggle(channelId).unwrap();
      setSubscribed((prev) => !prev);
      toast.success(
        subscribed ? "Unsubscribed successfully" : "Subscribed successfully"
      );
    } catch (error) {
      toast.error("Failed to update subscription");
      console.error(error);
    }
  };

  const isOwnChannel = userInfo?._id === channelId;

  return (
    <button
      onClick={handleSubscribe}
      disabled={isLoading || isOwnChannel}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        isOwnChannel
          ? "bg-gray-400 text-gray-200 cursor-not-allowed"
          : subscribed
          ? "bg-gray-700 text-white hover:bg-gray-600"
          : "bg-red-600 text-white hover:bg-red-700"
      }`}
    >
      {isOwnChannel
        ? "Subscribe"
        : subscribed
        ? "Unsubscribe"
        : "Subscribe"}
    </button>
  );
};

export default Subscription;
