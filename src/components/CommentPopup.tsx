import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

import CommentsList from "./CommentsList";
const API_KEY = process.env.REACT_APP_API_KEY;

export type Comment = {
  commentID: string;
  userIcon: string;
  userIconImage: HTMLImageElement;
  username: string;
  commentDate: string;
  commentTimestamp: string | null;
  commentText: string;
  commentDisplayText: string;
  readingTime: number;
  likes: number;
  isHidden: boolean;
};

type CommentSnippet = {
  etag: string;
  id: string;
  kind: string;
  replies: {
    comments: Array<any>;
  };
  snippet: {
    canReply: boolean;
    isPublic: boolean;
    topLevelComment: {
      etag: string;
      id: string;
      kind: string;
      snippet: {
        authorChannelId: {
          value: string;
        };
        authorChannelUrl: string;
        authorDisplayName: string;
        authorProfileImageUrl: string;
        canRate: boolean;
        likeCount: number;
        publishedAt: string;
        textDisplay: string;
        textOriginal: string;
        updatedAt: string;
        videoId: string;
        viewerRating: string;
      };
    };
  };
  totalReplyCount: number;
  videoId: string;
};

type CommentPopupProps = {
  videoID: string;
  isVideoValid: boolean;
  currentTime: number;
};

const CommentPopup: React.FC<CommentPopupProps> = ({
  videoID,
  isVideoValid,
  currentTime,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [displayedComments, setDisplayedComments] = useState<Comment[]>([]);

  const formatRelativeTime = (date: string) => {
    const commentDate = new Date(date);
    return formatDistanceToNow(commentDate, { addSuffix: true });
  };

  const convertTimestampToSeconds = (timestamp: string | null) => {
    const [minutes, seconds] = timestamp!.split(":");
    const convertedSeconds = parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
    return convertedSeconds;
  };

  const calculateReadingTime = (commentText: string) => {
    // Average reading speed in words per second
    const wordsPerSecond = 200 / 60;

    // Calculate the number of words in the comment text
    const words = commentText.split(" ").length;

    // Calculate the reading time in seconds (rounded up to the nearest whole number)
    const readingTimeSeconds = Math.ceil(words / wordsPerSecond);
    return readingTimeSeconds;
  };

  const filterCommentsByTimestamp = (commentArray: CommentSnippet[]) => {
    const timestampRegex =
      /\b(?:[0-5]?[0-9]):[0-5][0-9]:[0-5][0-9]\b|\b(?:[0-5]?[0-9]):[0-5][0-9]\b/;

    return commentArray.filter((item: any) => {
      const topLevelComment = item?.snippet?.topLevelComment;
      const textDisplay = topLevelComment?.snippet?.textDisplay;
      return textDisplay && timestampRegex.test(textDisplay);
    });
  };

  const sortFilteredCommentsByTimeStamp = (commentArray: Comment[]) => {
    return commentArray.sort((a, b) => {
      const getTimeComponents = (timestamp: string) => {
        const [hours, minutes, seconds] = timestamp.split(":").map(Number);
        if (!isNaN(hours) && !isNaN(minutes) && isNaN(seconds)) {
          // If the timestamp is "00:00", hours are 0
          return { hours: 0, minutes: hours, seconds: minutes };
        } else {
          // Otherwise, if timestamp is "hh:mm:ss", handle it normally
          return {
            hours: isNaN(hours) ? 0 : hours,
            minutes: isNaN(minutes) ? 0 : minutes,
            seconds: isNaN(seconds) ? 0 : seconds,
          };
        }
      };

      const aTimeComponents = getTimeComponents(a.commentTimestamp || "0:0");
      const bTimeComponents = getTimeComponents(b.commentTimestamp || "0:0");

      // Convert timestamps to total seconds for comparison
      const aTotalSeconds =
        aTimeComponents.hours * 3600 +
        aTimeComponents.minutes * 60 +
        aTimeComponents.seconds;
      const bTotalSeconds =
        bTimeComponents.hours * 3600 +
        bTimeComponents.minutes * 60 +
        bTimeComponents.seconds;

      return aTotalSeconds - bTotalSeconds;
    });
  };

  const getFirstTimeStampFromComment = (displayCommentText: string) => {
    const timestampRegex =
      /\b(?:[0-5]?[0-9]):[0-5][0-9]:[0-5][0-9]\b|\b(?:[0-5]?[0-9]):[0-5][0-9]\b/;
    const match = displayCommentText.match(timestampRegex);

    return match ? match[0] : null;
  };

  // FETCHING ALL COMMENTS FROM VIDEO
  useEffect(() => {
    if (!isVideoValid) return;
    const fetchTopComment = async (
      videoID: string,
      API_KEY: string | undefined,
      maxResults: Number
    ) => {
      const apiUrl = `https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet%2Creplies&maxResults=${maxResults}&videoId=${videoID}&order=relevance&key=${API_KEY}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      const filteredComments = filterCommentsByTimestamp(data.items);
      setComments(() => {
        const comments: Comment[] = filteredComments.map(
          (filteredComment: CommentSnippet) => {
            const commentData = filteredComment.snippet.topLevelComment;

            const comment: Comment = {
              commentID: commentData.id,
              userIcon: commentData.snippet.authorProfileImageUrl,
              userIconImage: new Image(),
              username: commentData.snippet.authorDisplayName,
              commentDate: formatRelativeTime(commentData.snippet.publishedAt),
              commentTimestamp: getFirstTimeStampFromComment(
                commentData.snippet.textDisplay
              ),
              commentText: commentData.snippet.textDisplay,
              commentDisplayText: commentData.snippet.textOriginal,
              readingTime: calculateReadingTime(
                commentData.snippet.textDisplay
              ),
              likes: commentData.snippet.likeCount,
              isHidden: false,
            };
            // Attach event listener to load event of the image
            comment.userIconImage.onload = () => {
              // Once the image is loaded, update the state
              setComments((prevComments) => {
                const updatedComments = prevComments.map((prevComment) => {
                  if (prevComment.commentID === comment.commentID) {
                    // Copy the comment and update the userIconImage
                    return {
                      ...prevComment,
                      userIconImage: comment.userIconImage,
                    };
                  }
                  return prevComment;
                });
                return updatedComments;
              });
            };

            // Start loading the image
            comment.userIconImage.src = comment.userIcon;

            return comment;
          }
        );
        const sortedComments = sortFilteredCommentsByTimeStamp(comments);
        return sortedComments;
      });
    };
    fetchTopComment(videoID, API_KEY, 100);
  }, [isVideoValid]);

  // FILTERING COMMENTS TO BE DISPLAYED AT CURRENT MOMENT
  useEffect(() => {
    const currentComment = comments.find((comment) => {
      if (
        convertTimestampToSeconds(comment.commentTimestamp) < currentTime &&
        convertTimestampToSeconds(comment.commentTimestamp) +
          comment.readingTime >
          currentTime &&
        comment !== undefined
      ) {
        setDisplayedComments((prevComs) => {
          //check if comment is already in array to prevent duplicates
          const existingCommentIndex = prevComs.findIndex(
            (com) => com.commentID === comment.commentID
          );
          if (existingCommentIndex !== -1) return prevComs;

          prevComs.push({
            commentID: comment.commentID,
            userIcon: comment.userIcon,
            userIconImage: comment.userIconImage,
            username: comment.username,
            commentDate: comment.commentDate,
            commentTimestamp: comment.commentTimestamp,
            commentText: comment.commentText,
            commentDisplayText: comment.commentDisplayText,
            readingTime: calculateReadingTime(comment.commentDisplayText) * 2,
            likes: comment.likes,
            isHidden: false,
          });
          return prevComs;
        });
      }
      setDisplayedComments((prevComs) => {
        return prevComs.filter((com) => {
          const startTime = Number(
            convertTimestampToSeconds(com.commentTimestamp)
          );
          const endTime = startTime + Number(com.readingTime);
          const currentTimeInSeconds = Number(currentTime);

          return (
            currentTimeInSeconds >= startTime && currentTimeInSeconds <= endTime
          );
        });
      });
    });
  }, [currentTime]);

  return (
    <CommentsList
      comments={displayedComments}
      setDisplayedComments={setDisplayedComments}
    />
  );
};

export default CommentPopup;
