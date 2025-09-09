import React, { useState } from "react";
import { SiHomebridge, SiAirplayvideo } from "react-icons/si";
import { FiSettings, } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaHistory } from "react-icons/fa";

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Username safe fallback
  const { userInfo } = useSelector((state) => state.auth);
  const username = userInfo?.username || "Guest";

//  console.log("Sidebar Username:", username);
  return (
    <div
      style={{
        zIndex: 999,
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(5px)",
        borderRight: "1px solid rgba(255, 255, 255, 0.2)",
      }}
      className={`${
        isExpanded ? "w-[15%]" : "w-[4%]"
      } lg:flex md:hidden sm:hidden flex-col justify-between py-6 text-white h-screen fixed transition-all duration-300 ease-in-out`}
      id="navigation-container"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col space-y-8">
        {/* Home */}
        <Link
          to="/"
          className="flex items-center gap-3 px-2 transition-transform transform hover:translate-x-2 hover:text-purple-300"
        >
          <SiHomebridge size={26} />
          {isExpanded && (
            <span className="nav-item-name transition-opacity duration-300">
              HOME
            </span>
          )}
        </Link>

        {/* Your Channel */}
        <Link
          to={`/user-channel/${username}`}
          className="flex items-center gap-3 px-2 transition-transform transform hover:translate-x-2 hover:text-purple-300"
        >
          <SiAirplayvideo size={26} />
          {isExpanded && (
            <span className="nav-item-name transition-opacity duration-300">
              YOUR CHANNEL
            </span>
          )}
        </Link>

        {/* Settings */}
        <Link
          to="/setting"
          className="flex items-center gap-3 px-2 transition-transform transform hover:translate-x-2 hover:text-purple-300"
        >
          <FiSettings size={26} />
          {isExpanded && (
            <span className="nav-item-name transition-opacity duration-300">
              SETTINGS
            </span>
          )}
        </Link>
        <Link
          to="/watch-history"
          className="flex items-center gap-3 px-2 transition-transform transform hover:translate-x-2 hover:text-purple-300"
        >
          <FaHistory size={26} />
          {isExpanded && (
            <span className="nav-item-name transition-opacity duration-300">
              WATCH HISTORY
            </span>
          )}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
