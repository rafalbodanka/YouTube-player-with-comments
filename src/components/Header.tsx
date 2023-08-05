import { SetStateAction } from "react";
import MaterialUISwitch from "./MaterialUISwitch";
import HomeIcon from "./HomeIcon";

type HeaderProps = {
  darkMode: boolean;
  setDarkMode: React.Dispatch<SetStateAction<boolean>>;
};

const Header: React.FC<HeaderProps> = ({ darkMode, setDarkMode }) => {
  return (
    <div
      className={`${
        darkMode ? "bg-darkerAlmostBlack" : "bg-darkerYtRed"
      } flex justify-between align-center`}
    >
      <div className="text-almostWhite p-8 font-bold text-sm md:text-xl flex gap-4 items-center">
        <span
          className="cursor-pointer"
          onClick={() => window.location.reload()}
        >
          <HomeIcon />
        </span>
      </div>
      <div className="flex items-center pr-2 md:pr-6">
        <MaterialUISwitch
          checked={darkMode}
          onChange={() => setDarkMode((prevMode) => !prevMode)}
        />
        <span className="text-almostWhite font-bold text-xs md:text-lg">
          Dark mode
        </span>
      </div>
    </div>
  );
};

export default Header;
