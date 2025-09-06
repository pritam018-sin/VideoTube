import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../../redux/api/userApiSlice";
import { setCredentials } from "../../redux/feature/auth/authSlice";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get("redirect") || "/";

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [userInfo, navigate, redirect]);

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({
        email: emailOrUsername,
        username: emailOrUsername,
        password,
      }).unwrap();

      dispatch(setCredentials({ ...res.data }));
      toast.success("Logged in");
      navigate(redirect);
    } catch (err) {
      console.error("Login error", err);
      toast.error(err?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={submitHandler}
        className="w-full max-w-md p-8 rounded-2xl shadow-lg border border-white/20 backdrop-blur-xl bg-white/10"
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-white tracking-tight">
          Welcome Back
        </h2>

        <input
          required
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          placeholder="Email or Username"
          className="w-full p-3 mb-4 rounded-xl border border-gray-300/20 bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 mb-6 rounded-xl border border-gray-300/20 bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          disabled={isLoading}
          className="w-full py-3 rounded-xl font-semibold text-lg 
            bg-gradient-to-r from-rose-600 via-red-500 to-pink-500 
            text-white hover:opacity-90 transition-all shadow-md cursor-pointer"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-6 text-center text-gray-300">
          New here?{" "}
          <Link to="/register" className="text-blue-400 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
