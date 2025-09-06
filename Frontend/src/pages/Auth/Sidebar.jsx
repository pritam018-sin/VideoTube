import React, { useState } from 'react'
import { 
  SiHomebridge,
  SiSuperuser,
    
 } from "react-icons/si";
 import {FiSettings} from "react-icons/fi";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { useSelector, useDispatch } from "react-redux";

const Sidebar = () => {

  // const { cartItems } = useSelector((state) => state.cart);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);  // Toggle dropdown visibility on click
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div
      style={{
        zIndex: 999,
        background: "rgba(0, 0, 0, 0.8)", // Adds transparency
        backdropFilter: "blur(5px)", // Subtle blur for modern look
        borderRight: "1px solid rgba(255, 255, 255, 0.2)", // Subtle border for clarity
      }}
      className={`${
        showSidebar ? "w-[15%]" : "w-[4%]"  // Control width based on hover
      } x:flex lg:flex md:hidden sm:hidden flex-col justify-between p-4 
      text-white h-[100vh] fixed transition-all duration-300 ease-in-out`}
      id="navigation-container"
      onMouseEnter={() => setShowSidebar(true)}  // Show user details on hover
      onMouseLeave={() => setShowSidebar(false)}  // Hide user details when mouse leaves
    >
      <div className="flex flex-col justify-center space-y-4">
        <Link
          to="/"
          className="flex items-center transition-transform transform hover:translate-x-2 hover:text-purple-300"
        >
          <SiHomebridge className="mr-2 mt-[3rem]" size={showSidebar ? 26 : 30} />
          {showSidebar && <span className="nav-item-name mt-[3rem]">HOME</span>}
        </Link>
        <Link
          to="/profile"
          className="flex items-center transition-transform transform hover:translate-x-2 hover:text-purple-300"
        >
          <SiSuperuser className="mr-2 mt-[3rem]" size={showSidebar ? 26 : 30} />
          {showSidebar && <span className="nav-item-name mt-[3rem]">PROFILE</span>}
        </Link>
        <Link
          to="/setting"
          className="flex items-center transition-transform transform hover:translate-x-2 hover:text-purple-300"
        >
          <FiSettings className="mr-2 mt-[3rem]" size={showSidebar ? 26 : 30} />
          {showSidebar && <span className="nav-item-name mt-[3rem]">SETTINGS</span>}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;

