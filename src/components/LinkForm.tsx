import React, { useState, useEffect, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { TextField } from "@mui/material";
import BootstrapButton from "./BootstrapButton";
import axios from "axios";

const API_KEY = process.env.REACT_APP_API_KEY;

// Function to validate if the URL is a valid YouTube video URL
const isValidYouTubeUrl = (url: string): boolean => {
  // Regular expression to match YouTube video URLs
  const youtubeRegex =
    /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/;
  return youtubeRegex.test(url);
};

type LinkFormProps = {
  darkMode: boolean;
  setIsFetching: React.Dispatch<SetStateAction<boolean>>;
  setVideoID: React.Dispatch<SetStateAction<string>>;
  setIsVideoValid: React.Dispatch<SetStateAction<boolean>>;
};

const LinkForm: React.FC<LinkFormProps> = ({
  darkMode,
  setIsFetching,
  setVideoID,
  setIsVideoValid,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm();

  const hangleGetVideo = async (url: string) => {
    const isValidURL = isValidYouTubeUrl(url);
    if (!isValidURL) {
      setError("url", {
        type: "manual",
        message: "Invalid YouTube video URL",
      });
      return;
    }
    setIsFetching(true);

    let videoIDWithoutTimestamp;
    try {
      if (url.includes("?v=")) {
        // Format 1: https://www.youtube.com/watch?v=videoID
        const videoID = url.split("?v=")[1];
        videoIDWithoutTimestamp = videoID.split("&t=")[0];
        // Rest of the code that uses videoID
      } else if (url.includes("youtu.be/")) {
        // Format 2: https://youtu.be/videoID
        const videoID = url.split("youtu.be/")[1].split("/")[0];
        videoIDWithoutTimestamp = videoID.split("&t=")[0];
      }
    } catch (error: any) {
      setIsVideoValid(false);
    }
    try {
      //check if video exists
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoIDWithoutTimestamp}&key=${API_KEY}`
      );
      if (response.data.pageInfo.totalResults > 0) {
        if (videoIDWithoutTimestamp) setVideoID(videoIDWithoutTimestamp);
        setIsVideoValid(true);
      } else {
        setError("url", {
          type: "server",
          message: "Video not found",
        });
        setIsVideoValid(false);
      }
      setIsFetching(false);
    } catch (err) {
      setIsVideoValid(false);
    }
  };

  return (
    <div className="flex justify-center">
      <form
        onSubmit={handleSubmit((data) => {
          hangleGetVideo(data.url);
        })}
        className="flex flex-col gap-4 w-80"
      >
        <TextField
          sx={{
            input: {
              color: darkMode ? "#efefef" : "#000000",
            },
            label: {
              color: darkMode ? "#efefef" : "#000000",
            },
            "& .MuiOutlinedInput-root:hover": {
              "& > fieldset": {
                borderColor: "info.main",
              },
            },
            "& .MuiOutlinedInput-root": {
              "& > fieldset": {
                borderColor: "info.main",
              },
            },
            "& .MuiInputBase-input": {
              WebkitTextFillColor: darkMode ? "#efefef" : "#000000",
            },
          }}
          label="YouTube video URL"
          {...register("url")}
        />
        {errors.url && (
          <p className="text-ytRed flex justify-center">
            {errors.url.message?.toString()}
          </p>
        )}
        <div className="flex justify-center">
          <BootstrapButton
            variant="contained"
            disabled={watch("url", "").length < 1}
            className="font-bold"
            type="submit"
          >
            Get video
          </BootstrapButton>
        </div>
      </form>
    </div>
  );
};

export default LinkForm;
