'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { show_search, search_bar_action } from '@/Redux/Action';
import axios from 'axios';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from "next/navigation";
import Loader from "../../others/loader";
import Theoretical from './Theoretical';
import CountUp from "react-countup";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import { FaRobot, FaUsers, FaAdjust } from "react-icons/fa";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import { AiOutlineDollarCircle } from "react-icons/ai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase } from "@fortawesome/free-solid-svg-icons";
import { BsRobot } from "react-icons/bs";


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
);



const Practice = () => {
    const dispatch = useDispatch();
    const [hasSubscription, setHasSubscription] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false); // Track payment success
    const [isCheckingSubscription, setIsCheckingSubscription] = useState(true); // Track if checking subscription
    const router = useRouter();

    const [dashboardStats, setDashboardStats] = useState(null); // To store fetched data
    const [darkMode, setDarkMode] = useState(false); // State for dark mode toggle
    const [selectedTopic, setSelectedTopic] = useState("FrontEnd Web Development");
    const [showAnalysis, setshowAnalysis] = useState(true);

    const handleStartInterview = () => {
        setshowAnalysis(false); // Switch to theoretical interview view
    };

    const lineChartData = {
        labels: dashboardStats?.Jobs_post?.map((item) => item.day) || [], // Defaults to an empty array
        datasets: [
            {
                label: "Job Posts Per Day",
                data: dashboardStats?.Jobs_post?.map((item) => item.count) || [], // Default to an empty array if no data
                borderColor: "#0099FF",
                backgroundColor: "rgba(0, 153, 255, 0.2)",
                tension: 0.4,
            },
        ],
    };

    const barChartData = {
        labels: dashboardStats?.jobs_by_category.map((item) => item.skills) || [],
        datasets: [
            {
                label: "Job Posts by Category",
                data: dashboardStats?.jobs_by_category.map((item) => item.count) || [],
                backgroundColor: "rgba(54, 162, 235, 0.7)",
            },
        ],
    };

    const pieChartData = {
        labels: dashboardStats?.jobs_by_workplace?.map((item) => item.workplace_type) || [],
        datasets: [
            {
                data: dashboardStats?.jobs_by_workplace?.map((item) => {
                    const total = dashboardStats?.jobs_by_workplace.reduce((acc, curr) => acc + curr.count, 0);
                    return parseFloat(((item.count / total) * 100).toFixed(2)); // Round off to 2 decimal places
                }) || [],
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
            },
        ],
    };

    const doughnutChartData = {
        labels: dashboardStats?.jobs_by_preference.map((item) => item.employment_type) || [],
        datasets: [
            {
                data: dashboardStats?.jobs_by_preference.map((item) => {
                    const total = dashboardStats?.jobs_by_preference.reduce((acc, curr) => acc + curr.count, 0);
                    return parseFloat(((item.count / total) * 100).toFixed(2)); // Round off to 2 decimal places
                }) || [],
                backgroundColor: ["#FF5733", "#33FF57", "#3357FF"],
            },
        ],
    };

    const subscriptionData = [
        { type: "Users", count: dashboardStats?.user_count || 0, bgColor: "purple", Icon: FaUsers },
        { type: "Profit", count: dashboardStats?.total_net_profit || 0, bgColor: "green", Icon: AiOutlineDollarCircle },
        { type: "Jobs", count: dashboardStats?.total_jobs || 0, bgColor: "blue", Icon: FaAdjust },
        { type: "Subscription", count: dashboardStats?.total_subscriptions || 0, bgColor: "green", Icon: BsRobot },
    ];


    // Hide search and reset search bar state
    useEffect(() => {
        dispatch(show_search(false));
        dispatch(search_bar_action(''));
    }, [dispatch]);

    // Check if the user already has a subscription
    useEffect(() => {
        const checkSubscription = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:3001/has-prac-subscription", { withCredentials: true });
                setHasSubscription(response.data.practice_subscription); // Set the subscription status
                if (response.data.practice_subscription) {
                    setPaymentSuccess(true); // If already subscribed, show practice module
                }
                const response1 = await axios.get("http://127.0.0.1:3001/dashboard/", { withCredentials: true }); // Replace with your API URL
                const data = await response1.data;
                setDashboardStats(data); // Store fetched data in state

            } catch (error) {
                toast.error("Error checking subscription status. Please try again.");
            } finally {
                setIsCheckingSubscription(false); // End loading state
            }
        };

        checkSubscription();
    }, []);

    // Handle the payment process
    const handlePayment = async (event) => {
        event.preventDefault(); // Prevent the page from refreshing

        setIsLoading(true);

        try {
            const response = await axios.post(
                'http://127.0.0.1:3001/create_checkout_session_prac/',
                { practice_type: 'practice' },
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
                    toast.error("Failed to initiate payment. Please try again.");
                }
            } else {
                toast.error("Checkout failed. Please try again later.");
            }
        } catch (error) {
            toast.error("An error occurred while initiating payment. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const sessionId = new URLSearchParams(window.location.search).get('session_id');
        if (sessionId) {
            axios.post('http://127.0.0.1:3001/verify_payment_prac/', { session_id: sessionId }, { withCredentials: true })
                .then(response => {
                    if (response.status === 200) {
                        setPaymentSuccess(true); // Set payment success state to true
                        toast.success("Payment successful! You now have access to the practice module.");

                        // Remove session_id from the URL
                        const currentUrl = window.location.href;
                        const newUrl = currentUrl.split('?')[0]; // Remove the query parameters
                        router.replace(newUrl, undefined, { shallow: true });
                    } else {
                        toast.error("Payment verification failed. Please try again.");
                    }
                })
                .catch(error => {
                    toast.error("An error occurred while verifying payment. Please try again.");
                });
        }
    }, [router]);

    // Show loader while checking subscription status
    if (isCheckingSubscription) {
        return (
            <>
                <Loader />
            </>
        );
    }

    // Show practice module if the user has subscription or after payment success
    const showPracticeModule = paymentSuccess || hasSubscription;


    return (
        <div className="min-h-screen text-gray-900 font-sans ">
            {showPracticeModule ? (

                showAnalysis ? (
                    <>
                        <div
                            className={`container mx-auto p-6 min-h-screen flex flex-col space-y-8 ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-black"
                                } mt-[3.75rem]`}
                        >

                            <section>
                                <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6  ">
                                    <div
                                        className={`${darkMode ? "bg-gray-900" : "bg-white"
                                            } p-6 rounded-lg shadow-md flex flex-col sm:flex-col lg:flex-row items-center justify-between gap-4 sm:gap-4 lg:gap-6 border-l-4 border-[#0073b1] transition-all duration-300`}
                                    >
                                        {/* Left side: Start Interview Button */}
                                        <button
                                            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none transition-all duration-300 w-full sm:w-auto"
                                            onClick={handleStartInterview}
                                        >
                                            Start Interview
                                        </button>

                                        {/* Right side: Dropdown for Selecting Topic */}
                                        <div className="sm:mt-4 w-full sm:w-auto lg:w-auto">
                                            <select
                                                className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-md focus:ring-[#0073b1] focus:border-[#0073b1] outline-none transition-all duration-300"
                                                onChange={(e) => setSelectedTopic(e.target.value)}
                                            >
                                                <option value="FrontEnd Web Development">FrontEnd Web Development</option>
                                                <option value="BackEnd Web Development">BackEnd Web Development</option>
                                                <option value="Full Stack Web Development">Full Stack Web Development</option>
                                                <option value="App Development">App Development</option>
                                                <option value="DB Administrator">DB Administrator</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </section>



                            {/* Charts Section */}
                            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div
                                    className={`${darkMode ? "bg-gray-900" : "bg-white"
                                        } p-6 rounded-lg shadow-md border-l-4 border-[#0073b1]`}
                                >
                                    <h3 className="text-lg font-semibold mb-4">Job Posts Per Day</h3>
                                    <Line data={lineChartData} />
                                </div>

                                <div
                                    className={`${darkMode ? "bg-gray-900" : "bg-white"
                                        } p-6 rounded-lg shadow-md border-l-4 border-[#0073b1]`}
                                >
                                    <h3 className="text-lg font-semibold mb-4">Job Posts by Category</h3>
                                    <Bar data={barChartData} />
                                </div>
                            </section>
                            <section className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
                                <div
                                    className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"
                                        } p-6 rounded-xl shadow-md border-l-4 border-[#0073b1] transform transition duration-300 hover:shadow-xl overflow-hidden`}
                                >
                                    <h3 className="text-lg font-semibold mb-4">Workplace Distribution</h3>
                                    <div className="w-full h-64 relative">
                                        <Pie
                                            data={pieChartData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    tooltip: {
                                                        callbacks: {
                                                            label: (tooltipItem) =>
                                                                `${tooltipItem.label}: ${tooltipItem.raw}%`,
                                                        },
                                                    },
                                                    legend: {
                                                        position: "right",
                                                        labels: {
                                                            boxWidth: 20,
                                                            padding: 15,
                                                            font: {
                                                                size: 14,
                                                            },
                                                        },
                                                    },
                                                },
                                            }}
                                            style={{ width: "100%", height: "100%" }}
                                        />
                                    </div>
                                </div>

                                <div
                                    className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"
                                        } p-6 rounded-xl shadow-md border-l-4 border-[#0073b1] transform transition duration-300 hover:shadow-xl overflow-hidden`}
                                >
                                    <h3 className="text-lg font-semibold mb-4">Job Post Preferences</h3>
                                    <div className="w-full h-64 relative">
                                        <Doughnut
                                            data={doughnutChartData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    tooltip: {
                                                        callbacks: {
                                                            label: (tooltipItem) =>
                                                                `${tooltipItem.label}: ${tooltipItem.raw}%`,
                                                        },
                                                    },
                                                    legend: {
                                                        position: "right",
                                                        labels: {
                                                            boxWidth: 20,
                                                            padding: 15,
                                                            font: {
                                                                size: 14,
                                                            },
                                                        },
                                                    },
                                                },
                                            }}
                                            style={{ width: "100%", height: "100%" }}
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </>
                ) : (
                    <>
                        <Theoretical topic={selectedTopic} />
                    </>
                )

                //    <Theoretical></Theoretical>
            ) : (
                // Subscription Plans
                <>
                    <h1 className="text-center text-4xl md:text-5xl font-extrabold text-gradient bg-[#F4F2EE] text-[#0073b1] bg-clip-text py-12 mt-12 mb-12 ">
                        Choose Your Plan
                    </h1>

                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
                        {/* Basic Plan */}
                        <div
                            className={`relative bg-white bg-opacity-80  rounded-xl shadow-xl p-8 text-center border  transition-transform transform hover:scale-40 hover:shadow-2xl ${hasSubscription ? 'opacity-50' : ''}`}
                        >
                            <div className="absolute top-0 right-0 bg-[#0073b1] text-white text-sm font-bold py-1 px-4 rounded-bl-lg">
                                Selected Plan
                            </div>
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0073b1] to-[#00548f] mb-6">
                                Basic
                            </h2>
                            <p className="text-4xl font-extrabold text-gray-900 mb-2">$0.00</p>
                            <p className="text-sm text-gray-500 mb-6">Billed monthly</p>
                            <ul className="text-left text-gray-700 space-y-4 text-sm">
                                <li className="flex items-center gap-4">
                                    <span className="text-red-500 font-bold">✘</span> Practice Interview for AI Module
                                </li>
                                <li className="flex items-center gap-4">
                                    <span className="text-red-500 font-bold">✘</span> Market Dashboard (Trending Jobs)
                                </li>
                            </ul>
                            <button
                                className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold text-sm rounded-md shadow-lg cursor-not-allowed"
                                disabled
                            >
                                Already Selected
                            </button>
                        </div>

                        {/* Subscription Plan */}
                        <div
                            className="relative bg-white bg-opacity-80  rounded-xl shadow-xl p-8 text-center border border-gray-300 transition-transform transform hover:scale-40 hover:shadow-2xl"
                        >
                            <div className="absolute top-0 left-0 bg-[#0073b1] text-white text-sm font-bold py-1 px-4 rounded-br-lg">
                                Most Popular
                            </div>
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0073b1] to-[#00548f]" />
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0073b1] to-[#00548f] mb-6">
                                Subscription
                            </h2>
                            <p className="text-4xl font-extrabold text-gray-900 mb-2">$50.00</p>
                            <p className="text-sm text-gray-500 mb-6">Billed monthly</p>
                            <ul className="text-left text-gray-700 space-y-4 text-sm">
                                <li className="flex items-center gap-3">
                                    <span className="text-green-500 font-bold">✔</span> Practice Interview for AI Module
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-green-500 font-bold">✔</span> Market Dashboard (Trending Jobs)
                                </li>
                            </ul>
                            <button
                                className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-[#0073b1] to-[#00548f] text-white font-semibold text-sm rounded-md shadow-lg transition-transform hover:scale-40 hover:shadow-xl"
                                onClick={handlePayment}
                            >
                                Select Plan
                            </button>
                        </div>
                    </div>
                </>



            )}
        </div>
    );
};

export default Practice;
