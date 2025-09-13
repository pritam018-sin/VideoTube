import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSubscribeToggleMutation } from "../redux/api/subscriptionApiSlice";

const Subscription = ({ channelId, isSubscribed: initialSubscribed }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [subscribeToggle, { isLoading }] = useSubscribeToggleMutation();

  // local state maintain karne ke liye
  const [subscribed, setSubscribed] = useState(initialSubscribed);

  // agar parent se prop update ho jaye (e.g. video change), to sync karne ke liye
  useEffect(() => {
    setSubscribed(initialSubscribed);
  }, [initialSubscribed]);

  const handleSubscribe = async () => {
    if (!userInfo) {
      navigate("/login");
      return;
    }

    try {
      await subscribeToggle(channelId).unwrap();
      setSubscribed((prev) => !prev); // toggle state instantly
      toast.success(
        subscribed ? "Unsubscribed successfully" : "Subscribed successfully"
      );
    } catch (error) {
      toast.error("Failed to update subscription");
      console.error(error);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={isLoading}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        subscribed
          ? "bg-gray-700 text-white hover:bg-gray-600"
          : "bg-red-600 text-white hover:bg-red-700"
      }`}
    >
      {subscribed ? "Unsubscribe" : "Subscribe"}
    </button>
  );
};

export default Subscription;
