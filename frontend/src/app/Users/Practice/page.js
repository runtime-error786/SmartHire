'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { show_search, search_bar_action } from '@/Redux/Action';
import axios from 'axios';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from "next/navigation";
import Loader from "../../others/loader";

const Practice = () => {
    const dispatch = useDispatch();
    const [hasSubscription, setHasSubscription] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false); // Track payment success
    const [isCheckingSubscription, setIsCheckingSubscription] = useState(true); // Track if checking subscription
    const router = useRouter();

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
                <Loader/>
            </>
        );
    }

    // Show practice module if the user has subscription or after payment success
    const showPracticeModule = paymentSuccess || hasSubscription;

    return (
        <div className="min-h-screen text-gray-900 font-sans py-12 mt-12">
            {showPracticeModule ? (
                // Practice Module
                <div className="text-center py-12">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gradient bg-[#F4F2EE] text-[#0073b1] bg-clip-text mb-16">
                        Practice Interview for AI Module
                    </h1>
                    <p className="text-xl text-gray-600 mb-4">You now have access to the AI practice interview module. Start practicing now!</p>
                    <button className="px-8 py-4 bg-[#0073b1] text-white font-semibold text-xl rounded-xl hover:bg-blue-600">
                        Start Practicing
                    </button>
                </div>
            ) : (
                // Subscription Plans
                <>
    <h1 className="text-center text-4xl md:text-5xl font-extrabold text-gradient bg-[#F4F2EE] text-[#0073b1] bg-clip-text mb-12">
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
