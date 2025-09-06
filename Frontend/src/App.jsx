import React from 'react'
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./pages/Auth/Sidebar";
import Navbar from "./pages/Auth/Navbar";


const App = () => {
  return (
    <div>
      <ToastContainer />
      <Sidebar />
      <Navbar />
      <main className="py-3">
        <Outlet />
      </main>
    </div>
  );
};

export default App;
