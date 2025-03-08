// import { useState, useEffect, useRef } from "react";
// import axios from 'axios';
// import Technical from "./Technical";

// export default function Theoretical({ topic }) {
//     const [isRecording, setIsRecording] = useState(false);
//     const [recordingComplete, setRecordingComplete] = useState(false);
//     const [transcript, setTranscript] = useState("");
//     const [question, setQuestion] = useState("");
//     const recognitionRef = useRef(null);
//     const [questionNO, setQuestionNO] = useState(1);
//     const [totalScore, setTotalScore] = useState(0);
//     const [maxScore, setMaxScore] = useState(10);
//     const [isFetching, setIsFetching] = useState(false);
//     const [pastQuestions, setPastQuestions] = useState([]);
//     const [isEditing, setIsEditing] = useState(true);
//     const [isSubmitting, setIsSubmitting] = useState(false); // Tracks if the answer is being submitted

//     const fetchQuestion = async () => {
//         if (isFetching) return;
//         setIsFetching(true);

//         try {
//             const pastQuestionsStr = pastQuestions.join(',');
//             const response = await axios.get(
//                 'http://127.0.0.1:3001/get_interview_questions/',
//                 {
//                     params: {
//                         topic: topic,
//                         difficulty: 'medium',
//                         past_questions: pastQuestionsStr
//                     },
//                     withCredentials: true,
//                     headers: { 'Content-Type': 'application/json' }
//                 }
//             );
//             const newQuestion = response.data.question;
//             setQuestion(newQuestion);
//             setPastQuestions(prevQuestions => [...prevQuestions, newQuestion]);
//         } catch (error) {
//             console.error("Error fetching question:", error);
//         } finally {
//             setIsFetching(false);
//         }
//     };

//     const speakQuestion = (text) => {
//         const utterance = new SpeechSynthesisUtterance(text);
//         utterance.lang = "en-US";
//         utterance.rate = 1;
//         window.speechSynthesis.speak(utterance);
//     };

//     const startRecording = () => {
//         setIsRecording(true);
//         setRecordingComplete(false);

//         recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//         recognitionRef.current.continuous = true;
//         recognitionRef.current.interimResults = true;

//         recognitionRef.current.onresult = (event) => {
//             let completeTranscript = "";

//             for (let i = 0; i < event.results.length; i++) {
//                 const transcriptPart = event.results[i][0].transcript.trim();
//                 completeTranscript += ` ${transcriptPart}`;
//             }

//             setTranscript(completeTranscript.trim());
//         };

//         recognitionRef.current.onerror = (event) => {
//             console.error("Speech recognition error:", event.error);
//             setIsRecording(false);
//             setRecordingComplete(true);
//             restartRecording();
//         };

//         recognitionRef.current.onend = () => {
//             setIsRecording(false);
//             setRecordingComplete(true);
//             setIsEditing(true);
//         };

//         recognitionRef.current.start();
//     };

//     const restartRecording = () => {
//         if (isRecording) {
//             recognitionRef.current.stop();
//             setTimeout(() => {
//                 startRecording();
//             }, 500);
//         }
//     };

//     const stopRecording = () => {
//         if (recognitionRef.current) {
//             recognitionRef.current.stop();
//         }
//         setIsRecording(false);
//         setRecordingComplete(true);
//     };

//     const handleToggleRecording = () => {
//         if (!isRecording) {
//             startRecording();
//         } else {
//             stopRecording();
//         }
//     };

//     const handleChangeTranscript = (e) => {
//         setTranscript(e.target.value);
//     };

//     const resetTranscript = () => {
//         setTranscript("");
//         setRecordingComplete(false);
//     };

//     const submitAnswer = async () => {
//         if (transcript) {
//             setIsSubmitting(true);
//             try {
//                 const response = await axios.post(
//                     'http://127.0.0.1:3001/check_answer/',
//                     {
//                         question: question,
//                         answer: transcript,
//                     },
//                     {
//                         withCredentials: true,
//                         headers: { 'Content-Type': 'application/json' },
//                     }
//                 );

//                 const result = response.data.result;
//                 if (result === 'yes') {
//                     setTotalScore(totalScore + 1);
//                 }

//                 setQuestionNO(questionNO + 1);
//                 resetTranscript();
//                 setRecordingComplete(true);
//                 fetchQuestion();
//             } catch (error) {
//                 console.error("Error submitting answer:", error);
//             } finally {
//                 setIsSubmitting(false);
//             }
//         }
//     };

//     useEffect(() => {
//         if (questionNO!=6) {
//         setRecordingComplete(true);
//         fetchQuestion();
//         }
//     }, []);

//     useEffect(() => {
//         if (question && questionNO!=6) {
//             speakQuestion(question);
//         }
//     }, [question]);

//     return (

//         questionNO == 6 ? (
//             <Technical totalScore={totalScore} maxScore={maxScore} questionNO={questionNO} topic={topic}></Technical>

//         )
//             : (
//                 <>
//                     <div className="flex items-center justify-center min-h-screen bg-[#F4F2EE] py-6 mt-12">
//                         <div className="w-full max-w-3xl p-6 sm:p-8 bg-white rounded-xl shadow-lg">
//                             <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#0073b1] mb-6">Theoretical Interview</h1>

//                             {/* Total Score Section */}
//                             <div className="mb-8 p-6 bg-blue-100 rounded-lg shadow-md flex flex-col sm:flex-row items-center justify-between">
//                                 <p className="text-lg font-medium text-[#0073b1]">Total Score:</p>
//                                 <div className="mt-4 sm:mt-0 px-4 py-2 bg-[#0073b1] text-white text-lg font-bold rounded-full shadow-md">
//                                     {isSubmitting ? (
//                                         <>
//                                             <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                                         </>
//                                     ) : (
//                                         `${totalScore} / ${maxScore}`
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Question Section */}
//                             <div className="mb-8 p-6 bg-blue-50 rounded-lg shadow-md max-h-40 overflow-y-auto">
//                                 {isFetching ? (
//                                     <div className="flex justify-center items-center h-20">
//                                         <div className="w-8 h-8 border-4 border-[#0073b1] border-t-transparent rounded-full animate-spin" />
//                                     </div>
//                                 ) : (
//                                     <p className="text-lg font-medium text-[#0073b1]">
//                                         <span className="font-bold">Question {questionNO}:</span>{" "}
//                                         <span className="font-semibold text-gray-800">{question}</span>
//                                     </p>
//                                 )}
//                             </div>

//                             {/* Transcript and Status */}
//                             {(isRecording || transcript) && (
//                                 <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-md max-h-50 overflow-y-auto">
//                                     <div className="flex justify-between items-center mb-4">
//                                         <p className="text-lg font-semibold text-gray-700">
//                                             {recordingComplete ? "Recording Complete" : "Recording in Progress"}
//                                         </p>
//                                         {isRecording && <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />}
//                                     </div>

//                                     {isEditing ? (
//                                         <textarea
//                                             value={transcript}
//                                             onChange={handleChangeTranscript}
//                                             className="w-full h-24 p-2 border rounded-lg bg-white text-gray-800"
//                                         />
//                                     ) : (
//                                         <p className="text-gray-600">{transcript || "Start speaking..."}</p>
//                                     )}
//                                 </div>
//                             )}

//                             {/* Buttons Section */}
//                             <div className="flex flex-wrap justify-center gap-6">
//                                 {/* Record Button */}
//                                 <button
//                                     onClick={handleToggleRecording}
//                                     className={`flex items-center justify-center w-20 h-20 rounded-full focus:outline-none shadow-md ${isRecording ? "bg-red-600 hover:bg-red-700" : "bg-[#0073b1]"}`}
//                                 >
//                                     {isRecording ? (
//                                         <svg className="h-12 w-12 text-white" viewBox="0 0 24 24">
//                                             <path fill="white" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
//                                         </svg>
//                                     ) : (
//                                         <svg viewBox="0 0 256 256" className="w-12 h-12 text-white">
//                                             <path
//                                                 fill="currentColor"
//                                                 d="M128 176a48.05 48.05 0 0 0 48-48V64a48 48 0 0 0-96 0v64a48.05 48.05 0 0 0 48 48ZM96 64a32 32 0 0 1 64 0v64a32 32 0 0 1-64 0Zm40 143.6V232a8 8 0 0 1-16 0v-24.4A80.11 80.11 0 0 1 48 128a8 8 0 0 1 16 0a64 64 0 0 0 128 0a8 8 0 0 1 16 0a80.11 80.11 0 0 1-72 79.6Z"
//                                             />
//                                         </svg>
//                                     )}
//                                 </button>

//                                 {/* Submit Button */}
//                                 <button
//                                     onClick={submitAnswer}
//                                     disabled={!transcript || isSubmitting}
//                                     className={`px-6 py-3 rounded-full shadow-md ${transcript ? "bg-[#0073b1]  text-white" : "bg-gray-400 text-gray-200 cursor-not-allowed"}`}
//                                 >
//                                     {isSubmitting ? (
//                                         <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                                     ) : (
//                                         "Submit"
//                                     )}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </>
//             )

//     );
// }