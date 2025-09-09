import React from "react";

const VideosTab = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Replace with API data map */}
      <div className="bg-gray-800 p-4 rounded-lg">🎬 Video 1</div>
      <div className="bg-gray-800 p-4 rounded-lg">🎬 Video 2</div>
      <div className="bg-gray-800 p-4 rounded-lg">🎬 Video 3</div>
    </div>
  );
};

export default VideosTab;
