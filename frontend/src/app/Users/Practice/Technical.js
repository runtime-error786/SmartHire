"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css"; // Dark theme for the editor

const Technical = ({ totalScore, maxScore, questionNO, topic }) => {
  const [code, setCode] = useState("");
  const [totalScores, setTotalScore] = useState(totalScore);
  const [maxScores, setMaxScore] = useState(maxScore);
  const [questionNos, setQuestionNo] = useState(questionNO);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [question, setQuestion] = useState("");
  const [pastQuestions, setPastQuestions] = useState([]);
  const [loadingQuestion, setLoadingQuestion] = useState(false); // Spinner state for loading question
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false); // State to manage modal visibility
  const [feedback, setFeedback] = useState(""); // Feedback for incorrect answers
  const [testCompleted, setTestCompleted] = useState(false); // State to track if the test is completed

  useEffect(() => {
    if (questionNos > 10) {
      setTestCompleted(true); // End the test after 10 questions
    } else {
      fetchQuestion();
    }
  }, [questionNos]);

  const fetchQuestion = async () => {
    try {
      setLoadingQuestion(true); // Start loading spinner
      setCode(""); // Reset the code editor
      setQuestion(""); // Reset the question

      const pastQuestionsStr = pastQuestions.join(",");
      const response = await axios.get(
        "http://127.0.0.1:3001/get_coding_questions/",
        {
          params: {
            topic: topic,
            difficulty: "medium",
            past_questions: pastQuestionsStr,
          },
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      setQuestion(response.data.question);
      setPastQuestions((prev) => [...prev, response.data.question]);
    } catch (error) {
      console.error("Error fetching question:", error);
    } finally {
      setLoadingQuestion(false); // Stop loading spinner
    }
  };

  const handleSend = async () => {
    if (!code) return;

    setIsSubmitting(true);

    try {
      // Call the evaluation API
      const response = await axios.post(
        "http://127.0.0.1:3001/evaluate_code/",
        {
          question: question,
          code: code,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Evaluation Response:", response.data);

      // Update score if the code is correct
      if (response.data.result === "yes") {
        setTotalScore((prev) => prev + 1);
      } else {
        setFeedback(response.data.feedback || "No feedback provided.");
        setFeedbackModalVisible(true); // Show feedback modal
      }

      setQuestionNo((prev) => prev + 1);
    } catch (error) {
      console.error("Error evaluating code:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setFeedbackModalVisible(false);
  };

  // Render the test UI or the result page based on test completion
  if (testCompleted) {
    return (
      <div className="min-h-screen bg-[#F4F2EE] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl text-center">
          {totalScores > 7 ? (
            <>
              <h1 className="text-4xl font-bold text-green-600 mb-4">Congratulations! 🎉</h1>
              <p className="text-gray-700 text-lg mb-6">
                You scored <span className="font-bold">{totalScores} out of {maxScores}</span> in the <span className="font-bold">{topic}</span> test.
              </p>
              <p className="text-gray-600">You have passed the criteria. Keep up the great work!</p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-red-600 mb-4">Try Again! 😔</h1>
              <p className="text-gray-700 text-lg mb-6">
                You scored <span className="font-bold">{totalScores} out of {maxScores}</span> in the <span className="font-bold">{topic}</span> test.
              </p>
              <p className="text-gray-600">You need more practice. Don't give up!</p>
            </>
          )}
          <button
            onClick={() => window.location.reload()} // Reload the page to restart the test
            className="mt-6 px-6 py-3 bg-[#0073b1] text-white rounded-full shadow-md hover:bg-blue-700 transition-colors duration-300"
          >
            Restart Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F2EE] py-6 mt-12 flex flex-col items-center px-4 sm:px-6 lg:px-8">
      <header className="w-full max-w-4xl mb-8">
        <div className="bg-blue-100 rounded-lg shadow-md p-6 flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#0073b1]">
            Technical Interview
          </h1>
          <div className="mt-4 sm:mt-0 px-4 py-2 bg-[#0073b1] text-white text-lg font-bold rounded-full shadow-md flex items-center">
            {isSubmitting ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                <span>/ {maxScores}</span>
              </>
            ) : (
              `${totalScores} / ${maxScores}`
            )}
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 border-b md:border-b-0 md:border-r border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Question {questionNos}</h2>
            <div className="max-h-80 overflow-y-auto pr-2">
              {loadingQuestion ? (
                <div className="flex justify-center items-center h-80">
                  <div className="w-6 h-6 border-2 border-[#0073b1] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                  {question}
                </p>
              )}
            </div>
          </div>

          <div className="md:w-1/2 p-6 flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Answer</h2>
            <div className="flex-1 border border-gray-200 rounded-md overflow-y-auto max-h-80">
              <Editor
                value={code}
                onValueChange={setCode}
                highlight={(code) => highlight(code, languages.js, "javascript")}
                padding={15}
                className="bg-gray-800 text-gray-100 font-mono min-h-[300px] focus:outline-none"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSend}
                disabled={!code || isSubmitting}
                className={`px-6 py-3 rounded-full shadow-md transition-colors duration-300 ${
                  code && !isSubmitting
                    ? "bg-[#0073b1] text-white hover:bg-blue-700"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Feedback Modal */}
      {feedbackModalVisible && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">Feedback</h3>
            <div className="max-h-64 overflow-y-auto overflow-x-auto mb-4">
              <p className="text-gray-700">{feedback}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-[#0073b1] text-white rounded-full"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Technical;