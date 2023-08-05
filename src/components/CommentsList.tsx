import React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Comment } from "./CommentPopup"; // Comment type
import CommentItem from "./CommentItem";

type CommentsListProps = {
  comments: Comment[];
  setDisplayedComments: React.Dispatch<React.SetStateAction<Comment[]>>;
};

const CommentsList: React.FC<CommentsListProps> = ({
  comments,
  setDisplayedComments,
}) => {
  return (
    <div className="top-0 left-0 w-full absolute">
      <TransitionGroup>
        {comments.map((comment) => (
          <CSSTransition
            key={comment.commentID}
            timeout={1000}
            classNames={{
              enter: "fadeIn",
              exit: "fadeOut",
            }}
            unmountOnExit={true}
          >
            <CommentItem
              comment={comment}
              setDisplayedComments={setDisplayedComments}
            />
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>
  );
};

export default CommentsList;
