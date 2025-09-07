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

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      {/* <Route index={true} path="/" element={<Home />} /> */}
      <Route element={<PrivateRoute />}>
        <Route path="current-user" element={<UserProfile />} />
        <Route path="update-account-details" element={<UpdateProfile />} />
        <Route path="update-avatar" element={<UpdateAvatar />} />
        <Route path="update-cover-image" element={<UpdateCover />} />
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
