"use client";

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
import React, { useState, useEffect } from "react";
import axios from "axios";

// Registering Chart.js components
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

const Dashboard = () => {
    const [dashboardStats, setDashboardStats] = useState(null); // To store fetched data
    const [darkMode, setDarkMode] = useState(false); // State for dark mode toggle

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:3001/dashboard/", { withCredentials: true }); // Replace with your API URL
                const data = await response.data;
                setDashboardStats(data); // Store fetched data in state
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []); // Empty dependency array ensures the data is fetched only once when the component mounts

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

    return (
        <div
            className={`container mx-auto p-6 min-h-screen flex flex-col space-y-8 ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-black"
                } mt-[3.75rem]`}
        >
            {/* Dark Mode Toggle Button */}
            <div className="flex justify-end">
                <button
                    className="p-2 rounded-full bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
                    onClick={() => setDarkMode((prev) => !prev)}
                >
                    {darkMode ? "☀️" : "🌙"}
                </button>
            </div>

            {/* Subscription Cards Section */}
            <section>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {subscriptionData.map((sub, index) => (
                        <div
                            key={index}
                            className={`${darkMode ? "bg-gray-900" : "bg-white"
                                } p-6 rounded-lg shadow-md flex flex-col items-center border-l-4 border-[#0073b1] transition-transform transform hover:scale-105`}
                        >
                            <div className="mb-4">
                                {sub.type === "Jobs" ? (
                                    <FontAwesomeIcon
                                        icon={faBriefcase}
                                        className={`w-12 h-12 ${darkMode ? "text-white" : "text-black"}`}
                                    />
                                ) : (
                                    <sub.Icon className={`w-12 h-12 ${darkMode ? "text-white" : "text-black"}`} />
                                )}
                            </div>
                            <p
                                className={`hover:text-[#0073b1] transition-colors duration-200 ease-in-out ${darkMode ? "text-white" : "text-black"
                                    }`}
                            >
                                {sub.type}
                            </p>

                            <p className="text-3xl font-semibold">
                                <CountUp
                                    start={0}
                                    end={sub.count > 999 ? 999 : sub.count}
                                    duration={2}
                                    separator=","
                                    suffix={sub.count > 999 ? "+" : ""}
                                />
                            </p>
                        </div>
                    ))}
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
    );
};

export default Dashboard;
