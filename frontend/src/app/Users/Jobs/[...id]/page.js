"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "@/app/others/loader";
import { FaRobot, FaUserTie, FaExclamationCircle, FaBuilding, FaMapMarkerAlt, FaClipboardList, FaClock, FaArrowLeft, FaCheckCircle, FaFlag, FaFileContract, FaVoicemail, FaEnvelope } from "react-icons/fa";
import { MdOutlineWork } from "react-icons/md";
import { useDispatch } from 'react-redux';
import { show_search } from "@/Redux/Action";
import { InlineWidget } from "react-calendly";
import { PopupWidget } from "react-calendly";

const Job = ({ params }) => {
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [jobToReport, setJobToReport] = useState(null);
    const [feedback, setFeedback] = useState(""); // Feedback input
    const [feedbackError, setFeedbackError] = useState(null); // Feedback validation error
    const [report, setreport] = useState("No");
    const dispatch = useDispatch();
    dispatch(show_search(false));

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:3001/get_jobs/${params.id}`, { withCredentials: true });
                setJob(response.data);
                const response1 = await axios.get(`http://127.0.0.1:3001/check_report_status/${params.id}`, { withCredentials: true });
                setreport(response1.data.message);

            } catch (err) {
                setError(err.response?.data?.error || "Failed to fetch job details.");
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetails();
    }, [params.id]);

    const reportJob = async (jobId) => {
        if (!feedback.trim()) {
            setFeedbackError("Feedback is required.");
            return;
        }

        try {
            await axios.post(
                'http://127.0.0.1:3001/report/',
                { job_id: jobId, feedback },
                { withCredentials: true }
            );
            setShowModal(false); // Close modal after reporting
            setFeedback(""); // Clear feedback input
            setreport("Yes")
        } catch (err) {
            console.error("Error reporting job:", err);
        }
    };

    const handleReportClick = (jobId) => {
        setJobToReport(jobId);
        setShowModal(true);
        setFeedback("");
        setFeedbackError(null);
    };

    const handleCancel = () => {
        setShowModal(false);
        setFeedback("");
        setFeedbackError(null);
    };

    const applyJob_manual = async (jobId, interviewType) => {
        // Assuming 'job' is available in your context with recruiter_email
        const recruiterEmail = job.recruiter_email;

        // Construct the Calendly URL with both the recruiter and candidate emails
      //  const calendlyUrl = `https://calendly.com/smarthire-notreply`;

        // // Open the Calendly URL in a popup window
        // const popupWindow = window.open(
        //     calendlyUrl,
        //     'CalendlyPopup',
        //     'width=800,height=600,scrollbars=yes,resizable=yes,top=100,left=100'
        // );

        // if (!popupWindow) {
        //     alert("Please allow popups to schedule the interview.");
        // }
    };



    const applyJob = async (jobId, interviewType) => {
        if (interviewType === "manual") {
            applyJob_manual(jobId, interviewType)
        } else if (interviewType === "ai") {
            alert("You have successfully applied for the job AI!");
        }
    };


    if (loading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 mt-12 bg-gray-50" style={{ backgroundColor: "#F4F2EE" }}>
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-6 sm:p-8 border border-gray-200">
                <h1 className="text-4xl font-extrabold text-[#0073b1] mb-6 ">{job.job_name}</h1>

                {/* Job Details Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <div className="flex items-center space-x-4 text-gray-700">
                        <FaBuilding className="text-[#0073b1] h-6 w-6" />
                        <p className="font-medium break-words max-w-full">
                            Company: <span className="text-gray-800">{job.company_name}</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-700">
                        <FaMapMarkerAlt className="text-red-500 h-6 w-6" />
                        <p className="font-medium break-words max-w-full">
                            Location: <span className="text-gray-800">{job.job_location}</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-700">
                        <MdOutlineWork className="text-green-600 h-6 w-6" />
                        <p className="font-medium break-words max-w-full">
                            Workplace Type: <span className="text-gray-800">{job.workplace_type}</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-700">
                        <FaClipboardList className="text-yellow-600 h-6 w-6" />
                        <p className="font-medium break-words max-w-full">
                            Employment Type: <span className="text-gray-800">{job.employment_type}</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-700">
                        <FaClock className="text-[#0073b1] h-6 w-6" />
                        <p className="font-medium break-words max-w-full">
                            Posted On: <span className="text-gray-800">{new Date(job.created_at).toLocaleDateString()}</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-700">
                        <FaClock className="text-gray-500 h-6 w-6" />
                        <p className="font-medium break-words max-w-full">
                            Last Updated: <span className="text-gray-800">{new Date(job.updated_at).toLocaleDateString()}</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-700">
                        {job.interview_type.toLowerCase() === "ai" ? (
                            <>
                                <FaRobot className="text-[#0073b1] h-6 w-6" />
                                <p className="font-medium break-words max-w-full">
                                    <span className="text-gray-800">AI Interview</span>
                                </p>
                            </>
                        ) : job.interview_type.toLowerCase() === "manual" ? (
                            <>
                                <FaUserTie className="text-[#0073b1] h-6 w-6" />
                                <p className="font-medium break-words max-w-full">
                                    <span className="text-gray-800">Manual Interview</span>
                                </p>
                            </>
                        ) : (
                            <>
                                <FaExclamationCircle className="text-[#0073b1] h-6 w-6" />
                                <p className="font-medium break-words max-w-full">
                                    <span className="text-gray-800">Unknown Interview Type</span>
                                </p>
                            </>
                        )}
                    </div>

                    <div className="flex items-center space-x-4 text-gray-700">
                        {job.interview_type.toLowerCase() === "manual" ? (
                            <>
                                <FaEnvelope className="text-[#0073b1] h-6 w-6" />
                                <p className="font-medium break-words max-w-full">
                                    <span className="text-gray-800">{job.recruiter_email}</span>
                                </p>

                            </>
                        ) : (
                            <>

                            </>
                        )}
                    </div>
                </div>
                {job.interview_type.toLowerCase() === "manual" ? (
                    <>
                        <div className="flex justify-center items-center mt-4">
                            <p className="text-red-600 font-bold text-sm text-center bg-red-100 p-3 rounded-lg shadow-md">
                                It is necessary to record the recruiter’s email for further steps. Please ensure to invite the recruiter’s email as a guest when you schedule interview for the job.
                            </p>
                        </div>

                    </>
                ) : (
                    <>

                    </>
                )}





                {/* Job Description */}
                <div className="border-t border-gray-200 pt-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Job Description</h2>
                    <p className="text-gray-700 leading-relaxed break-words">{job.description}</p>
                </div>



                {/* Required Skills */}
                <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Required Skills</h2>
                    <ul className="list-disc pl-5 text-gray-700">
                        {job.skills.split(",").map((skill, index) => (
                            <li key={index} className="py-1 font-medium">
                                {skill.trim()}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto px-6 py-3 bg-[#0073b1] text-white font-semibold rounded-lg shadow-md transition-colors duration-300 hover:bg-[#005f8c]"
                    >
                        <FaArrowLeft className="mr-2 inline-block" /> Back to Jobs
                    </button>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center sm:justify-start">
                        <button
                            onClick={() => applyJob(job.id, job.interview_type.toLowerCase())}
                            className="w-full sm:w-auto px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md transition-colors duration-300 hover:bg-green-600"
                        >
                            Apply <FaCheckCircle className="ml-2 inline-block" />
                        </button>
                        <button
                            onClick={() => handleReportClick(job.id)}
                            disabled={report === "Yes"} // Disable the button if report status is "Yes"
                            className={`w-full sm:w-auto px-6 py-3 text-white font-semibold rounded-lg shadow-md transition-colors duration-300 
                ${report === "Yes"
                                    ? "bg-gray-400 cursor-not-allowed" // Disabled state
                                    : "bg-red-500 hover:bg-red-600"} // Enabled state
            `}
                            title={report === "Yes" ? "You have already reported this job" : "Report this job"}
                        >
                            Report <FaFlag className="ml-2 inline-block" />
                        </button>
                    </div>
                </div>
            </div>


            {/* Report Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50 px-4">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4">Report Job</h2>
                        <textarea
                            className={`w-full border ${feedbackError ? "border-red-500" : "border-gray-300"} rounded-lg p-2 mb-4`}
                            placeholder="Write one line feedback..."
                            value={feedback}
                            onChange={(e) => {
                                setFeedback(e.target.value);
                                setFeedbackError(null);
                            }}
                        />
                        {feedbackError && <p className="text-red-500 text-sm mb-2">{feedbackError}</p>}
                        <div className="flex justify-between">
                            <button
                                onClick={handleCancel}
                                className="px-6 py-2 bg-gray-400 text-white font-semibold rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => reportJob(jobToReport)}
                                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Job;
