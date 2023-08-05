import React from "react";
import { Comment } from "./CommentPopup"; // Import the Comment type

type CommentItemProps = {
  comment: Comment;
  setDisplayedComments: React.Dispatch<React.SetStateAction<Comment[]>>;
};

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  setDisplayedComments,
}) => {
  const handleCommentHidden = (commentId: string) => {
    setDisplayedComments((prevComments) => {
      const updatedComments = prevComments.map((prevCom) => {
        if (prevCom.commentID === commentId) {
          return { ...prevCom, isHidden: !prevCom.isHidden };
        }
        return prevCom;
      });
      return updatedComments;
    });
  };

  return (
    <div
      data-comment-id={comment.commentID}
      className="bg-almostBlack bg-opacity-70 font-Roboto font-14 font-400 text-almostWhite 1s ease w-full h-1/8 p-2 pl-8 border-b-2 border-almostBlack"
    >
      {!comment.isHidden && (
        <div className="flex gap-4 fadeIn">
          <div className="h-full">
            <img
              alt={`${comment.username} icon`}
              className="rounded-full cursor-pointer max-w-[48px] max-h-[48px]"
              src={comment.userIconImage.src}
            ></img>
          </div>
          <div>
            <div className="flex gap-4">
              <div className="cursor: pointer">{comment.username}</div>
              <div className="color: #AAAAAA">{comment.commentDate}</div>
            </div>
            <div>
              <p>{comment.commentDisplayText}</p>
            </div>
          </div>
        </div>
      )}
      <div
        onClick={() => {
          handleCommentHidden(comment.commentID);
        }}
        className="cursor-pointer flex justify-center"
      >
        {comment.isHidden ? "Show" : "Hide"}
      </div>
    </div>
  );
};

export default CommentItem;
