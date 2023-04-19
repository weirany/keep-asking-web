import React from "react";

function MoreQuestionsList({ moreQuestions, onClick }) {
  return (
    <div>
      {moreQuestions.map((q) => (
        <div className="row mt-4 text-end" key={q.questionId}>
          <div className="col">
            <button
              className="btn btn-outline-primary disable-hover-active text-end"
              type="button"
              onClick={() => onClick(q.questionId)}
            >
              {q.questionText}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MoreQuestionsList;
