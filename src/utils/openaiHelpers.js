import axios from "axios";

const openaiUrl = "https://api.openai.com/v1/chat/completions";
const openaiModel = "gpt-3.5-turbo";

const getMessagesWithBase = () => {
  return [
    {
      role: "system",
      content:
        "You are a helpful assistant. Keep using the same language as my first question. Do not switch to a different language.",
    },
  ];
};

const getHeaders = (apiKey) => {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  return { headers: headers };
};

export const getAnswer = async (apiKey, questionText, parentQuestion) => {
  let messages = getMessagesWithBase();

  if (Object.keys(parentQuestion).length > 0) {
    messages.push({ role: "user", content: parentQuestion.questionText });
    messages.push({ role: "assistant", content: parentQuestion.answerText });
  }
  messages.push({ role: "user", content: questionText });

  try {
    const data = {
      model: openaiModel,
      messages: messages,
    };

    const response = await axios.post(openaiUrl, data, getHeaders(apiKey));
    const answerText = response.data.choices[0].message.content;
    return answerText;
  } catch (error) {
    console.log(`getAnswer() error: ${error}`);
  }
};

export const getMoreQuestions = async (apiKey, questionText, answerText) => {
  let questionTexts = [];

  let messages = [
    ...getMessagesWithBase(),
    { role: "user", content: questionText },
    { role: "assistant", content: answerText },
    {
      role: "user",
      content:
        'Based on our discussion above, can you suggest five follow-up questions for me to ask in order to dive deeper into this topic? Answer with a JSON array of strings, nothing else. no explaination needed just the array. make sure it is a well formed JSON array. Example: ["What is your favorite color?", "What is your favorite food?"]. respond in the same language as your last answer.',
    },
  ];

  try {
    const data = {
      model: openaiModel,
      messages: messages,
    };

    const response = await axios.post(openaiUrl, data, getHeaders(apiKey));
    const moreQuestionTexts = JSON.parse(
      response.data.choices[0].message.content
    );

    for (const questionText of moreQuestionTexts) {
      questionTexts.push(questionText);
    }
    return questionTexts;
  } catch (error) {
    console.log(`getMoreQuestions() error: ${error}`);
  }
};
