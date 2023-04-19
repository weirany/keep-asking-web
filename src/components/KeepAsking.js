import "bootstrap/dist/css/bootstrap.min.css";
import "./KeepAsking.css";
import React, { useState, useEffect } from "react";
import Question from "../model/Question";
import { getAnswer, getMoreQuestions } from "../utils/openaiHelpers";
import MoreQuestionsList from "./MoreQuestionsList";

function KeepAsking() {
  const [inputKey, setInputKey] = useState("");
  const [savedKey, setSavedKey] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [rootQuestion, setRootQuestion] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [isAsking, setIsAsking] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem("OpenAIkey");
    if (storedKey) {
      setSavedKey(storedKey);
    }
  }, []);

  const handleStartOverButtonClick = () => {
    setInputValue("");
    setRootQuestion({});
    setCurrentQuestion({});
    setIsAsking(false);
  };

  const handleKeyInputChange = (e) => {
    setInputKey(e.target.value);
  };

  const handleUseKeyButtonClick = () => {
    localStorage.setItem("OpenAIkey", inputKey);
    setSavedKey(inputKey);
    setInputKey("");
  };

  const handleClearSavedKeyButtonClick = () => {
    localStorage.removeItem("OpenAIkey");
    setSavedKey("");
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAskButtonClick();
    }
  };

  const handleAskButtonClick = async () => {
    if (inputValue === "") {
      return;
    }

    setIsAsking(true);
    await askQuestion();
    setIsAsking(false);
  };

  const handleMoreQuestionClick = async (questionId) => {
    setIsAsking(true);
    await askQuestion(questionId);
    setIsAsking(false);
  };

  const handleStepBackClick = async () => {
    const parentQuestion = rootQuestion.getParentQuestionOf(
      currentQuestion.questionId
    );
    setCurrentQuestion(parentQuestion);
  };

  const askQuestion = async (questionId) => {
    let targetQuestion;

    // if questionId is not provided, it means we are asking a new question
    // or a new follow-up question
    if (!questionId) {
      const newQuestion = new Question();
      newQuestion.questionText = inputValue;

      // if currentQuestion is empty, it means we are asking a new question
      if (Object.keys(currentQuestion).length === 0) {
        setRootQuestion(newQuestion);
      } else {
        currentQuestion.addToMoreQuestionsInBulk([newQuestion.questionText]);
      }
      targetQuestion = newQuestion;
    } else {
      targetQuestion = currentQuestion.getQuestion(questionId);
    }

    // get answer and more questions, only if the question is not asked before
    if (
      targetQuestion.answerText === "" ||
      targetQuestion.moreQuestions.length === 0
    ) {
      targetQuestion.answerText = await getAnswer(
        savedKey,
        targetQuestion.questionText,
        currentQuestion
      );

      const moreQuestionTexts = await getMoreQuestions(
        savedKey,
        targetQuestion.questionText,
        targetQuestion.answerText
      );
      targetQuestion.addToMoreQuestionsInBulk(moreQuestionTexts);
    }

    setCurrentQuestion(targetQuestion);
    setInputValue("");
  };

  const hasMoreQuestions =
    currentQuestion &&
    currentQuestion.moreQuestions &&
    currentQuestion.moreQuestions.length > 0;

  return (
    <div className="container">
      {savedKey === "" ? (
        <div className="row mt-4">
          <div className="col">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Enter OpenAI key here..."
                value={inputKey}
                onChange={handleKeyInputChange}
              />
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleUseKeyButtonClick}
              >
                Use Key
              </button>
            </div>
            <div className="alert alert-secondary text-start mt-3 mb-3 mx-auto">
              <ol>
                <li>
                  The{" "}
                  <a
                    href="https://platform.openai.com/account/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    OpenAI key
                  </a>{" "}
                  is stored locally in your browser.
                </li>
                <li>
                  This app utilizes ChatGPT, which may generate inaccurate
                  information about people, places, or facts.
                </li>
              </ol>
            </div>
          </div>
        </div>
      ) : (
        <div className="row mt-4">
          {Object.keys(currentQuestion).length > 0 && (
            <div>
              {rootQuestion.getParentQuestionOf(currentQuestion.questionId) && (
                <div className="text-start flex-grow-1">
                  <button
                    className="btn btn-primary"
                    onClick={handleStepBackClick}
                  >
                    ← Step Back
                  </button>
                </div>
              )}

              <div className="row mt-4">
                <div className="col">
                  <div className="card text-bg-light">
                    <div className="card-body">
                      <strong>{currentQuestion.questionText}</strong>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mt-4">
                <div className="col">
                  <div className="card text-bg-light">
                    <div className="card-body text-start pre-wrap">
                      {currentQuestion.answerText}
                    </div>
                  </div>
                </div>
              </div>
              {isAsking ? (
                <div>
                  <br />
                  <span
                    className="spinner-grow spinner-grow-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Thinking...
                </div>
              ) : (
                hasMoreQuestions && (
                  <MoreQuestionsList
                    moreQuestions={currentQuestion.moreQuestions}
                    onClick={handleMoreQuestionClick}
                  />
                )
              )}
            </div>
          )}

          <div className="row mt-4">
            <div className="col">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter question here..."
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleAskButtonClick}
                  disabled={isAsking}
                >
                  {isAsking ? (
                    <span
                      className="spinner-grow spinner-grow-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : (
                    <>Ask</>
                  )}
                </button>
              </div>
            </div>
          </div>
          {Object.keys(currentQuestion).length > 0 && (
            <div className="row mt-4">
              <div className="col">
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={handleStartOverButtonClick}
                >
                  ↺ Start Over with a New Question
                </button>
              </div>
            </div>
          )}
          <div className="row mt-4">
            <div className="col">
              <button
                className="btn btn-warning"
                type="button"
                onClick={handleClearSavedKeyButtonClick}
              >
                ✕ Clear Saved OpenAI Key
              </button>
            </div>
          </div>
        </div>
      )}
      <br></br>
    </div>
  );
}

export default KeepAsking;
