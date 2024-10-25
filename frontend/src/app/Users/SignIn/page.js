"use client";

import React, { useState, useRef } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import "../../globals.css";
import bgImage from "../../Photos/bg.png";
import { GoogleLogin } from '@react-oauth/google';
import { Role_Action } from "@/Redux/Action";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [otp, setOtp] = useState(Array(6).fill(''));
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const dispatch = useDispatch();
    const userRole = useSelector((state) => state.Role_Reducer);
    const router = useRouter();

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const { credential } = credentialResponse;

            const response = await axios.post(
                'http://127.0.0.1:3001/decode-jwt/',
                { token: credential },
                { withCredentials: true }
            );

            toast.success('Login successful!');
            console.log('Decoded Data:', response.data.data);
            await dispatch(Role_Action("Candidate"));
            console.log(userRole);
            router.push("/Users/Home");
        } catch (error) {
            toast.error(error.response?.data?.error || 'Google Login failed.');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                'http://127.0.0.1:3001/login/',
                { email, password },
                { withCredentials: true }
            );
            toast.success('Login successful!');
            await dispatch(Role_Action("Candidate"));
            router.push("/Users/Home");
        } catch (error) {
            toast.error(error.response?.data?.error || 'Login failed.');
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:3001/send-otp_signin/', { email });
            setIsOtpSent(true);
            toast.success('OTP sent to your email!');
        } catch (error) {
            const errorMessage = error.response?.data?.error;

            if (errorMessage === 'Email does not exist') {
                toast.error('Email does not exist. Please check your email or sign up.');
                resetForm();
            } else {
                toast.error(errorMessage || 'Error sending OTP.');
            }
        }
    };


    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');
        try {
            const response = await axios.post('http://127.0.0.1:3001/verify-otp_signin/', { email, otp: otpCode });
            if (response.data.success) {
                setOtpVerified(true);
                toast.success('OTP verified. Enter your new password.');
            } else {
                toast.error('Invalid OTP.');
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error verifying OTP.');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        const specialCharRegex = /^(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;

        if (newPassword.length < 7 || !specialCharRegex.test(newPassword)) {
            toast.error("Password must be at least 8 characters long, contain one uppercase letter, one digit, and one special character.");
            return;
        }

        try {
            await axios.post('http://127.0.0.1:3001/forgot-password/', { email, newPassword });
            toast.success('Password reset successful. Please sign in.');
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error resetting password.');
        }
    };

    const resetForm = () => {
        setShowForgotPassword(false);
        setPassword('');
        setNewPassword('');
        setOtp(Array(6).fill(''));
        setIsOtpSent(false);
        setOtpVerified(false);
    };

    const handleSignupRedirect = () => {
        router.push('/Users/SignUp');
      };
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 px-4 sm:px-6 lg:px-8 mt-10 py-10">
            <div className="bg-white rounded-lg shadow-2xl p-8 sm:p-10 max-w-md w-full transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-blue-200">
                <div className="text-center mb-6">
                    <img src={bgImage.src} alt="Brand Logo" className="w-16 sm:w-20 mx-auto mb-4" />
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                        {showForgotPassword ? (isOtpSent ? "Enter OTP" : "Reset Password") : "Welcome Back!"}
                    </h1>
                    <p className="mt-2 text-gray-600 text-sm sm:text-base">
                        {showForgotPassword ? (isOtpSent ? "Enter the OTP sent to your email." : "Please enter your email to receive an OTP.") : "Please sign in to your account."}
                    </p>
                </div>

                {!showForgotPassword ? (
                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                aria-label="Email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300 ease-in-out shadow-sm"
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                aria-label="Password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300 ease-in-out shadow-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-300 ease-in-out shadow-md transform hover:scale-105 active:scale-95"
                        >
                            Login
                        </button>
                        <div className="flex items-center justify-center mt-6">
                            <GoogleLogin
                                onSuccess={handleGoogleLogin}
                                onError={() => toast.error('Google Login Failed')}
                                shape="pill"
                                buttonText="Sign In with Google"
                            />
                        </div>
                        <p className="mt-4 text-center text-gray-600 text-sm">
                            <a
                                onClick={() => setShowForgotPassword(true)}
                                className="text-blue-600 hover:underline cursor-pointer"
                            >
                                Forgot Password?
                            </a>
                        </p>
                        <div className="px-4 py-2 text-sm text-gray-400 text-center">
                            <span>Don't have an account?</span>
                            <button
                                className="text-blue-400 hover:underline"
                                onClick={handleSignupRedirect}
                            >
                                Sign Up
                            </button>
                        </div>
                    </form>
                ) : isOtpSent && otpVerified ? (
                    <form onSubmit={handleResetPassword}>
                        <div className="mb-4">
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                aria-label="New Password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300 ease-in-out shadow-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-300 ease-in-out shadow-md transform hover:scale-105 active:scale-95"
                        >
                            Reset Password
                        </button>
                    </form>
                ) : isOtpSent ? (
                    <>
                        <form onSubmit={handleVerifyOtp}>
                            <div className="mb-4 flex justify-between">
                                <OtpInput otp={otp} setOtp={setOtp} />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-300 ease-in-out shadow-md transform hover:scale-105 active:scale-95"
                            >
                                Verify OTP
                            </button>
                            <p className="mt-4 text-center text-gray-600 text-sm">
                                <a
                                    onClick={() => resetForm()}
                                    className="text-blue-600 hover:underline cursor-pointer"
                                >
                                    Resend OTP
                                </a>
                            </p>
                        </form>
                    </>
                ) : (
                    <form onSubmit={handleForgotPassword}>
                        <div className="mb-4">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                aria-label="Email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300 ease-in-out shadow-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-300 ease-in-out shadow-md transform hover:scale-105 active:scale-95"
                        >
                            Send OTP
                        </button>
                    </form>
                )}
            </div>
            <Toaster position="top-center" />
        </div>
    );
};

// OtpInput Component
const OtpInput = ({ otp, setOtp }) => {
    const inputRefs = useRef([]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return; // Allow only numbers
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Focus next input
        if (value && index < otp.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleBackspace = (index) => {
        if (index === 0) return; // Don't go back for the first input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
    };

    return (
        <>
            {otp.map((value, index) => (
                <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    value={value}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Backspace') {
                            handleBackspace(index);
                        }
                    }}
                    maxLength="1"
                    className="w-12 h-12 mx-1 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300 ease-in-out shadow-sm"
                />
            ))}
        </>
    );
};

export default SignIn;
