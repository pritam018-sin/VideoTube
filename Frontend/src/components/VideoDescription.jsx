import React, { useState } from "react";

const VideoDescription = ({ description, maxLength = 100 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) return null;

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const shouldTruncate = description.length > maxLength;
  const displayText = !shouldTruncate
    ? description
    : isExpanded
    ? description
    : description.substring(0, maxLength) + "...";

  return (
    <div className="mt-2">
      <p className="text-gray-400">{displayText}</p>
      {shouldTruncate && (
        <button
          onClick={toggleExpand}
          className="text-blue-500 text-sm mt-1 hover:underline"
        >
          {isExpanded ? "View Less" : "View More"}
        </button>
      )}
    </div>
  );
};

export default VideoDescription;
