import { generateGUID } from "../utils/generalHelpers";

export default class Question {
  constructor() {
    this.questionId = generateGUID();
    this.questionText = "";
    this.answerText = "";
    this.moreQuestions = [];
  }

  getQuestion(questionId) {
    if (this.questionId === questionId) {
      return this;
    } else {
      for (const question of this.moreQuestions) {
        const foundQuestion = question.getQuestion(questionId);
        if (foundQuestion) {
          return foundQuestion;
        }
      }
    }
    return null;
  }

  addToMoreQuestionsInBulk(moreQuestionTexts) {
    for (const questionText of moreQuestionTexts) {
      this.addToMoreQuestions(questionText);
    }
  }

  addToMoreQuestions(questionText) {
    let newQuestion = new Question();
    newQuestion.questionText = questionText;
    this.moreQuestions.push(newQuestion);
  }

  getParentQuestionOf(questionId) {
    if (this.questionId === questionId) {
      return null;
    } else {
      for (const question of this.moreQuestions) {
        if (question.questionId === questionId) {
          return this;
        } else {
          const foundQuestion = question.getParentQuestionOf(questionId);
          if (foundQuestion) {
            return foundQuestion;
          }
        }
      }
    }
    return null;
  }
}
