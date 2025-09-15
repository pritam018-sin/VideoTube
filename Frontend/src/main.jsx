import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from "react-redux";
import {store} from "./redux/store";


import { Route, RouterProvider, createRoutesFromElements } from "react-router";
import { createBrowserRouter } from "react-router-dom";

import PrivateRoute from "./components/PrivateRoute";

// Auth
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import UserProfile from './pages/User/UserProfile.jsx';
import UpdateProfile from './pages/User/UpdateProfile.jsx';
import UpdateAvatar from './pages/User/UpdateAvatar.jsx';
import UpdateCover from './pages/User/UpdateCover.jsx';
import UserChannel from './pages/User/UserChannel.jsx';
import WatchHistory from './pages/User/WatchHistory.jsx';
import WatchPage from './pages/WatchPage.jsx';
import HomePage from './pages/HomePage.jsx';
import UploadVideo from './pages/Video/UploadVideo.jsx';
import UserDashboard from './pages/User/UserDashboard.jsx';
import UserSubscriptionList from './pages/User/UserSubscriptionList.jsx';
import ChangePassword from './pages/User/ChangePassword.jsx';


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route index={true} path="/" element={<HomePage />} />
      <Route element={<PrivateRoute />}>
        <Route path="current-user" element={<UserProfile />} />
        <Route path="update-account-details" element={<UpdateProfile />} />
        <Route path="update-avatar" element={<UpdateAvatar />} />
        <Route path="update-cover-image" element={<UpdateCover />} />
        <Route path="change-password" element={<ChangePassword />} />
        <Route path="user-channel/:username" element={<UserChannel />} />
        <Route path="watch-history" element={<WatchHistory />} />
        <Route path="watch/:videoId" element={<WatchPage />} />
        <Route path="upload-video" element={<UploadVideo />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="subscriptions" element={<UserSubscriptionList />} />

        {/* <Route path="dashboard" element={<Dashboard />} /> */}
      </Route>
    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
