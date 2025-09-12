import React from "react";
import ReactPlayer from "react-player";

const VideoPlayer = ({ url, autoPlay = true, controls = true, muted = true }) => {
    cons
  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden">
      <ReactPlayer
        url={url}
        playing={autoPlay}
        controls={controls}
        muted={muted}
        width="100%"
        height="100%"
        className="rounded-2xl"
        config={{
          file: {
            attributes: {
              controlsList: "nodownload nofullscreen noremoteplayback",
              disablePictureInPicture: true,
              onContextMenu: (e) => e.preventDefault(),
            },
          },
        }}
      />
    </div>
  );
};

export default VideoPlayer;
