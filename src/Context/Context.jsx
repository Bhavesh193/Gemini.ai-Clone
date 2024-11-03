import { createContext, useState } from "react";
import run from "../config/gemini";

export const Context = createContext();

export default function ContextProvider(props) {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");

  // Function to add delay and animate the response text
  const delayPara = (index, nextWord) => {
    setTimeout(() => {
      setResultData((prev) => prev + nextWord);
    }, 75 * index);
  };

  // Function to handle sending of a new prompt
  const onSent = async (prompt) => {
    setResultData("");
    setLoading(true);
    setShowResult(true);

    const currentPrompt = prompt || input;

    // Only add to `prevPrompts` if not a duplicate
    if (!prevPrompts.includes(currentPrompt)) {
      setPrevPrompts((prev) => [...prev, currentPrompt]);
    }

    setRecentPrompt(currentPrompt);

    const response = await run(currentPrompt);
    displayFormattedResponse(response);

    setLoading(false);
    setInput("");
  };

  // Function to load a previous prompt without duplicating it in `prevPrompts`
  const loadPrevPrompt = async (selectedPrompt) => {
    setResultData("");
    setLoading(true);
    setShowResult(true);
    setRecentPrompt(selectedPrompt);

    const response = await run(selectedPrompt);
    displayFormattedResponse(response);

    setLoading(false);
  };

  // Helper function to format and animate the response text
  const displayFormattedResponse = (response) => {
    let responseArray = response.split("**");
    let newResponse = "";

    for (let i = 0; i < responseArray.length; i++) {
      if (i === 0 || i % 2 !== 1) {
        newResponse += responseArray[i];
      } else {
        newResponse += "<b>" + responseArray[i] + "</b>";
      }
    }

    let newResponse2 = newResponse.split("*").join("</br>");
    let newResponseArray = newResponse2.split(" ");
    for (let i = 0; i < newResponseArray.length; i++) {
      const nextWord = newResponseArray[i];
      delayPara(i, nextWord + " ");
    }
  };

  const contextValue = {
    onSent,
    loadPrevPrompt,
    input,
    setInput,
    recentPrompt,
    setRecentPrompt,
    prevPrompts,
    setPrevPrompts,
    showResult,
    setShowResult,
    loading,
    setLoading,
    resultData,
    setResultData,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
}
