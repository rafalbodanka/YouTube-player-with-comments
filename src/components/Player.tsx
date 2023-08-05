import { useState, useEffect, useRef } from "react";
import CommentPopup from "./CommentPopup";
import YouTube from "react-youtube";

type PlayerProps = {
  isFetching: boolean;
  videoID: string;
  isVideoValid: boolean;
};

const Player: React.FC<PlayerProps> = ({
  isFetching,
  videoID,
  isVideoValid,
}) => {
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Add the event listener for the resize event
    window.addEventListener("resize", handleResize);

    // Remove the event listener when the component is unmounted
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const opts = {
    height: ((windowWidth * 9) / 16) * 0.9,
    width: windowWidth * 0.9,
    playerVars: {
      autoplay: 1,
    },
  };

  const onPlay = (event: any) => {
    const target = event.target;
    setCurrentTime(Math.round(target.getCurrentTime()));

    if (intervalId) {
      clearInterval(intervalId); // Clear any previous interval if it exists
    }
    const newIntervalId = setInterval(() => {
      setCurrentTime(Math.round(target.getCurrentTime()));
    }, 100);
    setIntervalId(newIntervalId); // Store the new interval ID in the state
  };

  const onStateChange = (state: any) => {
    const playerState = state.data;
    if (
      playerState === YouTube.PlayerState.ENDED ||
      playerState === YouTube.PlayerState.PAUSED
    ) {
      if (intervalId) {
        clearInterval(intervalId); // Clear the interval when the player stops
        setIntervalId(null); // Reset the interval ID in the state
      }
    }
  };

  return (
    <div className="flex justify-center mt-12">
      {isFetching ? (
        <div className="flex border-t-4 border-gray-400 mt-36 border-t-almostBlack rounded-full w-20 h-20 animate-spin black"></div>
      ) : (
        <div>
          {isVideoValid && (
            <div className="relative">
              <YouTube
                opts={opts}
                id="ytplayer"
                title="YouTube video player"
                videoId={videoID}
                onStateChange={(state) => {
                  onStateChange(state);
                }}
                onPlay={onPlay}
              ></YouTube>
              <CommentPopup
                videoID={videoID}
                isVideoValid={isVideoValid}
                currentTime={currentTime}
              ></CommentPopup>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Player;
