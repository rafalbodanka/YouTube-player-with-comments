import { useState } from "react";
import Header from "./components/Header";
import LinkForm from "./components/LinkForm";
import Player from "./components/Player";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isVideoValid, setIsVideoValid] = useState(false);
  const [videoID, setVideoID] = useState("");
  return (
    <div
      className={`h-screen w-screen ${
        darkMode ? "bg-almostBlack" : "bg-almostWhite"
      }`}
    >
      <Header darkMode={darkMode} setDarkMode={setDarkMode}></Header>
      <p
        className={`flex justify-center p-8 font-bold text-sm md:text-xl items-center text-center ${
          darkMode ? "text-almostWhite" : "text-almostBlack"
        }`}
      >
        Play your favourite YouTube videos with top comments live
      </p>
      <LinkForm
        darkMode={darkMode}
        setIsFetching={setIsFetching}
        setVideoID={setVideoID}
        setIsVideoValid={setIsVideoValid}
      />
      <Player
        isVideoValid={isVideoValid}
        isFetching={isFetching}
        videoID={videoID}
      ></Player>
    </div>
  );
}

export default App;
