"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { SiGooglegemini } from "react-icons/si";
import Loader from "@/app/others/loader";
import { loadStripe } from '@stripe/stripe-js';
import { useDispatch } from "react-redux"
import { show_search } from "@/Redux/Action";
const UpdateJob = ({ params }) => {
    const dispatch = useDispatch();
    dispatch(show_search(false));
    const [recruiterData, setRecruiterData] = useState(null);
    const [formData, setFormData] = useState({
        job_id: "",
        job_name: "",
        job_location: "",
        workplace_type: "",
        employment_type: "",
        description: "",
        skills: [],
        interview_type: "manual", // Default is manual
        new_company_name: "", // To store new company name if provided
    });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const router = useRouter();
    const [subscription, setsubscription] = useState(false);
    const [error, setError] = useState(null); // State for error message



    useEffect(() => {
        if (!params.id) {
            setLoading(false); // Stop loading immediately if ID is missing
            return;
        }

        const fetchJobData = async () => {
            try {
                // Fetch recruiter and subscription data
                const [response2, response1] = await Promise.all([
                    axios.get("http://127.0.0.1:3001/get_recruiter_company", { withCredentials: true }),
                    axios.get("http://127.0.0.1:3001/has-ai-subscription", { withCredentials: true }),
                ]);
                setRecruiterData(response2.data);
                setsubscription(response1.data.ai_subscription);

                // Fetch job details
                const response = await axios.get(`http://127.0.0.1:3001/get_job/${params.id}`, { withCredentials: true });

                // Check if job data exists
                if (response.data && response.data.job_name) {
                    setFormData({
                        job_name: response.data.job_name || "",
                        job_id: response.data.id || "",
                        job_location: response.data.job_location || "",
                        workplace_type: response.data.workplace_type || "",
                        employment_type: response.data.employment_type || "",
                        description: response.data.description || "",
                        skills: response.data.skills || [],
                        interview_type: response.data.interview_type || "manual",
                        new_company_name: response.data.new_company_name || "",
                    });
                    setError(null); // Clear any previous error
                } else {
                    setError("No Post Available"); // Set error message if job doesn't exist
                }
            } catch (error) {
                setError("No Post Available"); // Set error message in case of an error
            } finally {
                setLoading(false); // Stop loading in all cases
            }
        };

        fetchJobData();
    }, [params.id]);

    const handlePayment = async (event) => {
        event.preventDefault(); // Prevent the page from refreshing
        sessionStorage.setItem('formData', JSON.stringify(formData));

        try {
            const response = await axios.post(
                'http://127.0.0.1:3001/create_checkout_session/',
                { interview_type: 'ai', job_id: params.id.toString() },
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (response.status === 200) {
                const stripePromise = await loadStripe('pk_test_51P0cjlP8GjJIjxDGEgyDXqRqhQThEMQl5KySJ1F7bhigoblE6MDvutJnx3n7LlTQx3HiA3zL9xYhnGwHTba03QpR00JWEq159G');
                const stripe = await stripePromise;

                const { error } = await stripe.redirectToCheckout({
                    sessionId: response.data.sessionId,
                });

                if (error) {
                    console.error('Error redirecting to checkout:', error);

                }
            } else {
                console.error('Checkout session creation failed');

            }
        } catch (error) {
            console.error('Error initiating payment:', error);

        }
    };


    // Payment verification function
    const history = useRouter();

    useEffect(() => {
        // Retrieve form data from sessionStorage
        const savedFormData = sessionStorage.getItem('formData');
        if (savedFormData) {

            setFormData(JSON.parse(savedFormData));
            setPage(3);

        }
        // Verify payment
        const sessionId = new URLSearchParams(window.location.search).get('session_id');
        if (sessionId) {
            axios.post('http://127.0.0.1:3001/verify_payment/', { session_id: sessionId }, { withCredentials: true })
                .then(response => {
                    if (response.status === 200) {
                        // Clear sessionStorage after successful payment verification
                        sessionStorage.removeItem('formData');
                        setsubscription(true);
                    } else {
                        console.error("Payment verification failed: ", response.data.error);
                    }
                })
                .catch(error => {
                    console.error("Payment verification failed:", error);
                });
        } else {
            console.error("Session ID is missing in the URL");
        }
    }, [history]);




    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const selectSingleOption = (field, option) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: prevData[field] === option ? "" : option,
        }));
    };

    const [validationErrors, setValidationErrors] = useState({});

    // Validation function for current page fields
    const validatePage = () => {
        const errors = {};

        // Page 1: Basic job details
        if (page === 1) {
            // Job title
            if (!formData.job_name.trim()) {
                errors.job_name = "Job title is required.";
            } else if (formData.job_name.length < 3) {
                errors.job_name = "Job title must be at least 3 characters long.";
            }

            // Job location
            if (!formData.job_location.trim()) {
                errors.job_location = "Job location is required.";
            } else if (formData.job_location.length < 3) {
                errors.job_location = "Job location must be at least 3 characters long.";
            }

            // Workplace type
            if (!formData.workplace_type.trim()) {
                errors.workplace_type = "Please select a workplace type.";
            }

            // Company name (new company name validation)
            if (formData.new_company_name && !recruiterData?.company_name) {
                const companyName = formData.new_company_name.trim();
                if (!/^[A-Za-z\s]+$/.test(companyName)) {
                    errors.new_company_name = "Company name is invalid. Please use only alphabets and spaces.";
                } else if (/\d/.test(companyName)) {
                    errors.new_company_name = "Company name should not contain numbers.";
                } else if (companyName.length < 2) {
                    errors.new_company_name = "Company name must be at least 2 characters long.";
                }
            } else if (!formData.new_company_name && !recruiterData?.company_name) {
                errors.new_company_name = "Company name is required.";
            }

        }

        // Page 2: Description, skills, and employment type
        if (page === 2) {
            // Description
            if (!formData.description.trim()) {
                errors.description = "Description is required.";
            } else if (formData.description.length < 10) {
                errors.description = "Description must be at least 10 characters long.";
            }

            // Skills selection
            if (formData.skills.length === 0) {
                errors.skills = "Please select at least one skill.";
            }

            // Employment type
            if (!formData.employment_type.trim()) {
                errors.employment_type = "Please select an employment type.";
            }
        }

        // Page 3: Interview type
        if (page === 3) {
            // Interview type
            if (!formData.interview_type.trim()) {
                errors.interview_type = "Please select an interview type.";
            }

            // If AI interview is selected, make sure the purchase is done
            if (formData.interview_type === "ai" && !formData.purchase_done) {
                errors.purchase_done = "You must purchase the AI interview to proceed.";
            }
        }

        setValidationErrors(errors);

        // Return true if there are no errors, otherwise return false
        return Object.keys(errors).length === 0;
    };


    const handleGenerateTitle = async () => {
        if (!formData.job_name.trim()) {
            setValidationErrors((prevErrors) => ({
                ...prevErrors,
                job_name: "Job title cannot be empty before generating from AI.",
            }));
            return;
        }

        try {
            // Replace with your AI service for title generation
            const response = await axios.post("http://127.0.0.1:3001/generate-job-title/", { prompt: formData.job_name }, { withCredentials: true });
            if (response.data?.professional_job_title) {
                setFormData({ ...formData, job_name: response.data.professional_job_title });
                setValidationErrors((prevErrors) => ({
                    ...prevErrors,
                    job_name: "", // Clear any previous errors
                }));
            }
        } catch (error) {
            console.error("Error generating job title:", error);
        }
    };


    // Update setPage function to include validation
    const handleNextPage = () => {
        if (validatePage()) {
            setPage(page + 1); // Proceed only if validation passes
        }
    };

    const handlePrevPage = () => {
        setPage(page - 1); // No validation needed for going back
    };


    const handleDelete = async () => {
        try {
            const response = await axios.delete(`http://127.0.0.1:3001/deletejob/${formData.job_id}`, { withCredentials: true });
            router.push("/Users/Posts");
        } catch (error) {
            console.error("Error deleting job post:", error);

        }
    };

    // Event to update the job post
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(
                `http://127.0.0.1:3001/updatejob/${formData.job_id}/`,
                {
                    job_name: formData.job_name,
                    workplace_type: formData.workplace_type,
                    job_location: formData.job_location,
                    employment_type: formData.employment_type,
                    description: formData.description,
                    skills: formData.skills,
                    interview_type: formData.interview_type,
                },
                { withCredentials: true }
            );
            router.push("/Users/Posts");
        } catch (error) {
            console.error("Error updating job post:", error);
        }
    };




    if (loading) return <>
        <Loader></Loader>
    </>;

    const employmentTypes = ["Full-time", "Part-time", "Contract", "Temporary", "Internship"];
    const skillOptions = ["Front-end", "Back-end", "Full Stack", "App Development", "DB Administrator"];
    const workplaceTypes = ["Remote", "On site", "Hybrid"];


    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center bg-red-100 text-red-600 p-6 rounded-lg shadow-lg max-w-md w-full">
                    <p className="text-xl font-semibold mb-4">No Post Available</p>
                    <p className="text-sm">It looks like the job you're looking for does not exist or could not be fetched. Please try again later.</p>
                </div>
            </div>
        );
    }




    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-50 py-10 px-4 lg:px-8" style={{ backgroundColor: "#F4F2EE", paddingTop: "4rem" }}>
            <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-8 sm:p-12 lg:p-16">
                <h1 className="text-3xl font-bold text-center text-[#0073b1] mb-8">Update Post</h1>
                <form className="space-y-6">
                    {page === 1 && (
                        <>
                            <div>
                                <label className="block text-md font-medium text-gray-700 mb-2">Company Name</label>
                                <input
                                    type="text"
                                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-600 transition duration-300 
        ${recruiterData?.company_name ? "cursor-not-allowed bg-gray-100 text-gray-400" : "border-gray-300"}`}
                                    value={recruiterData?.company_name || formData?.new_company_name}
                                    onChange={(e) => setFormData({ ...formData, new_company_name: e.target.value })}
                                    disabled={!!recruiterData?.company_name}
                                    placeholder={recruiterData?.company_name ? "Company name is set" : "Enter your company name"}
                                />
                                {validationErrors.new_company_name && (
                                    <p className="text-red-500 text-sm mt-1">{validationErrors.new_company_name}</p>
                                )}
                            </div>


                            {/* Job Title and Button in the same row */}


                            <div className="flex items-center space-x-4 relative">
                                <div className="flex-1">
                                    <label className="block text-lg font-semibold text-gray-800">Job Title</label>
                                    <div className="relative flex items-center">
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition pr-20"  // Increased pr-20 for button inside input field
                                            name="job_name"
                                            value={formData.job_name}
                                            onChange={handleInputChange}
                                            required
                                        />

                                        <button
                                            type="button"
                                            className="absolute right-0 top-1/2 transform -translate-y-1/2 py-3 px-4 bg-gradient-to-r from-[#0073b1] to-indigo-700 text-white rounded-md focus:outline-none focus:ring-4 focus:ring-[#0073b1] focus:ring-opacity-30 shadow-lg hover:shadow-xl active:scale-95"
                                            onClick={handleGenerateTitle}
                                        >
                                            <SiGooglegemini className="w-6 h-6 text-white" />
                                        </button>

                                    </div>
                                </div>
                            </div>
                            {validationErrors.job_name && <p className="text-red-500 text-sm mt-1">{validationErrors.job_name}</p>}


                            <div>
                                <label className="block text-lg font-semibold text-gray-800 mb-2">Location</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 transition"
                                    name="job_location"
                                    value={formData.job_location}
                                    onChange={handleInputChange}
                                    required
                                />
                                {validationErrors.job_location && <p className="text-red-500 text-sm mt-1">{validationErrors.job_location}</p>}
                            </div>

                            <div>
                                <label className="block text-lg font-semibold text-gray-800 mb-2">Workplace Type</label>
                                <div className="flex flex-wrap gap-3">
                                    {workplaceTypes.map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => selectSingleOption("workplace_type", type)}
                                            className={`px-4 py-2 rounded-lg border ${formData.workplace_type === type
                                                ? "bg-gray-700 text-white border-gray-700"
                                                : "bg-gray-200 text-gray-700 border-gray-300"
                                                } transition-all duration-200`}
                                        >
                                            {formData.workplace_type === type ? "✓" : "+"}{type}
                                        </button>
                                    ))}
                                </div>
                                {validationErrors.workplace_type && <p className="text-red-500 text-sm mt-1">{validationErrors.workplace_type}</p>}
                            </div>
                        </>
                    )}
                    {page === 2 && (
                        <>
                            <div>
                                <label className="block text-lg font-semibold text-gray-800 mb-2">Description</label>
                                <textarea
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 transition"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                ></textarea>
                                {validationErrors.description && <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>}

                            </div>
                            <div>
                                <label className="block text-lg font-semibold text-gray-800 mb-2">Skills</label>
                                <div className="flex flex-wrap gap-3">
                                    {skillOptions.map((skill) => (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => selectSingleOption("skills", skill)}
                                            className={`px-4 py-2 rounded-lg border ${formData.skills.includes(skill)
                                                ? "bg-gray-700 text-white border-gray-700"
                                                : "bg-gray-200 text-gray-700 border-gray-300"
                                                } transition-all duration-200`}
                                        >
                                            {formData.skills.includes(skill) ? "✓" : "+"}{skill}
                                        </button>
                                    ))}
                                    {validationErrors.skills && <p className="text-red-500 text-sm mt-1">{validationErrors.skills}</p>}

                                </div>
                            </div>
                            <div>
                                <label className="block text-lg font-semibold text-gray-800 mb-2">Employment Type</label>
                                <div className="flex flex-wrap gap-3">
                                    {employmentTypes.map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => selectSingleOption("employment_type", type)}
                                            className={`px-4 py-2 rounded-lg border ${formData.employment_type === type
                                                ? "bg-gray-700 text-white border-gray-700"
                                                : "bg-gray-200 text-gray-700 border-gray-300"
                                                } transition-all duration-200`}
                                        >
                                            {formData.employment_type === type ? "✓" : "+"} {type}
                                        </button>
                                    ))}

                                </div>
                                {validationErrors.employment_type && <p className="text-red-500 text-sm mt-1">{validationErrors.employment_type}</p>}
                            </div>
                        </>
                    )}
                    {page === 3 && (
                        <>
                            <div className="bg-gray-100 p-6 rounded-lg mb-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                    Interview Type Pricing
                                </h2>
                                <div className="space-y-4">
                                    {/* Manual Interview */}
                                    <div className="border p-4 rounded-lg bg-white shadow-md">
                                        <h3 className="font-semibold text-gray-700">
                                            Manual Interview (Free)
                                        </h3>
                                        <p className="text-gray-500">
                                            Basic interview setup for all users. Free of charge.
                                        </p>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="interview_type"
                                                value="manual"
                                                checked={formData.interview_type === "manual"}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, interview_type: e.target.value })
                                                }
                                            />
                                            <span>Select Manual Interview</span>
                                        </label>
                                    </div>

                                    {/* AI Interview (Only if subscription is true) */}
                                    {subscription && (
                                        <div className="border p-4 rounded-lg bg-white shadow-md">
                                            <h3 className="font-semibold text-gray-700">
                                                AI Interview (Paid)
                                            </h3>
                                            <p className="text-gray-500">
                                                AI-powered interview setup. Pay once when job post is closed.
                                            </p>
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    name="interview_type"
                                                    value="ai"
                                                    checked={formData.interview_type === "ai"}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, interview_type: e.target.value })
                                                    }
                                                />
                                                <span>Select AI Interview</span>
                                            </label>
                                        </div>
                                    )}

                                    {/* AI Interview Purchase (Visible only if no subscription) */}
                                    {!subscription && (
                                        <div className="border p-4 rounded-lg bg-white shadow-md">
                                            <h3 className="font-semibold text-gray-700">
                                                AI Interview (Paid)
                                            </h3>
                                            <p className="text-gray-500">
                                                AI-powered interview setup. Pay once when job post is closed.
                                            </p>
                                            <button
                                                className="px-6 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 mt-4"
                                                onClick={handlePayment}
                                            >
                                                Purchase AI Interview
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                    {page === 3 && (
                        <div className="flex justify-between mt-6">
                            <button
                                type="button"
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                onClick={handlePrevPage}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                onClick={handleUpdate}
                            >
                                Update Post
                            </button>
                        </div>
                    )}
                    {page !== 3 && (
                        <div className="flex justify-between mt-6">
                            <button
                                type="button"
                                className={`px-6 py-2 rounded-lg transition ${page === 1 ? 'bg-gray-200 text-gray-700 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer'}`}
                                onClick={handlePrevPage}
                                disabled={page === 1}
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                className={`px-6 py-2 rounded-lg transition ${page === 3 ? 'bg-gray-200 text-white-700 cursor-not-allowed' : 'bg-[#0073b1] text-white  cursor-pointer'}`}
                                onClick={handleNextPage}
                                disabled={page === 3}
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {page === 1 && (
                        <div className="mt-8 flex justify-between">
                            <button
                                type="button"
                                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                onClick={handleDelete}
                            >
                                Delete Post
                            </button>
                        </div>
                    )}



                </form>
            </div>
        </div>
    );
};

export default UpdateJob;
