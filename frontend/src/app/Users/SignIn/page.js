"use client";

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import "../../globals.css";
import bgImage from "../../Photos/bg.png";
import { GoogleLogin } from '@react-oauth/google';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
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
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const dispatch = useDispatch();
    const userRole = useSelector((state) => state.Role_Reducer);
    const router = useRouter();

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const { credential } = credentialResponse;
            const response = await axios.post('http://127.0.0.1:3001/decode-jwt/', { token: credential }, { withCredentials: true });

            toast.success('Login successful!');
            await dispatch(Role_Action("Candidate"));
            router.push("/Users/Home");
        } catch (error) {
            toast.error(error.response?.data?.error || 'Google Login failed.');
        }
    };

    const handleSignupRedirect = () => {
        router.push('/Users/SignUp');
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setEmailError("Invalid email format.");
            return;
        } else {
            setEmailError('');
        }

        if (!email || !password) {
            toast.error("Please enter both email and password.");
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:3001/login/', { email, password }, { withCredentials: true });
            toast.success('Login successful!');
            await dispatch(Role_Action("Candidate"));
            resetForm();
            router.push("/Users/Home");
        } catch (error) {
            setPasswordError("Invalid email or password.");
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setEmailError("Invalid email format.");
            return;
        } else {
            setEmailError('');
        }

        setLoading(true);
        try {
            await axios.post('http://127.0.0.1:3001/send-otp_signin/', { email });
            setIsOtpSent(true);
            setTimer(60); // Start countdown
            toast.success('OTP sent to your email!');

        } catch (error) {
            toast.error(error.response?.data?.error || 'Error sending OTP.');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP function
    const handleResendOtp = async () => {
        setLoading(true);
        try {
            await axios.post('http://127.0.0.1:3001/send-otp_signin/', { email });
            setTimer(60); // Restart countdown
            toast.success("OTP has been resent to your email!");
        } catch (error) {
            toast.error(error.response?.data?.error || "Error resending OTP.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (timer > 0) {
            const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(countdown);
        }
    }, [timer]);

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
    
        if (otp.includes('')) {
            toast.error("Please enter the complete OTP.");
            return;
        }
    
        try {
            // Make sure this request is a POST
            await axios.post('http://127.0.0.1:3001/verify_otp_signin/', { email, otp: otp.join('') });
            setOtpVerified(true);
            toast.success('OTP verified! Please reset your password.');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Invalid OTP.');
        }
    };
    
    const handleResetPassword = async (e) => {
        e.preventDefault();
    
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{8,}$/;
    
        // Check if newPassword meets the complexity requirements
        if (!newPassword) {
            toast.error("Please enter a new password.");
            return;
        }
    
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters long.");
            return;
        }
    
        if (!passwordRegex.test(newPassword)) {
            toast.error("Password must contain at least one uppercase letter, one special character, and be at least 8 characters long.");
            return;
        }
    
        try {
            await axios.post('http://127.0.0.1:3001/reset_password/', { email, newPassword });
            toast.success('Password reset successfully!');
            router.push("/Users/SignIn");
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
        setEmailError('');
        setPasswordError('');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F2EE] px-4 sm:px-6 lg:px-8 py-20">
            <div className="bg-[#FFFFFF] rounded-lg shadow-2xl p-8 sm:p-10 max-w-md w-full">
                <div className="text-center mb-6">
                    <img src={bgImage.src} alt="Brand Logo" className="w-16 sm:w-20 mx-auto mb-4" />
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                        {showForgotPassword ? (isOtpSent ? (otpVerified ? "Reset Password" : "Enter OTP") : "Reset Password") : "Welcome Back!"}
                    </h1>
                    <p className="mt-2 text-gray-600 text-sm sm:text-base">
                        {showForgotPassword ? (isOtpSent ? (otpVerified ? "Enter your new password." : "Enter the OTP sent to your email.") : "Please enter your email to receive an OTP.") : "Please sign in to your account."}
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
                            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                        </div>
                        <div className="mb-4 relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                aria-label="Password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300 ease-in-out shadow-sm"
                            />
                            <FontAwesomeIcon
                                icon={showPassword ? faEyeSlash : faEye}
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3 cursor-pointer text-gray-500"
                            />
                            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-[#0073b1] text-white py-3 rounded-lg hover:bg-[#005582] focus:outline-none shadow-lg"
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
                        <div className="px-4 py-2 text-sm text-center">
                            <span className="text-gray-600">Don't have an account?</span>
                            <button
                                className="text-[#0073b1] font-bold hover:underline ml-1"
                                onClick={handleSignupRedirect}
                            >
                                Sign Up
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        {!otpVerified ? (
                            isOtpSent ? (
                                <form onSubmit={handleVerifyOtp}>
                                    <OtpInput otp={otp} setOtp={setOtp} />
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-300 ease-in-out shadow-md transform hover:scale-105 active:scale-95"
                                    >
                                        Verify OTP
                                    </button>
                                    {timer === 0 ? (
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            className="w-full bg-gray-200 text-blue-600 py-3 mt-2 rounded-lg focus:outline-none shadow-lg"
                                        >
                                            Resend OTP
                                        </button>
                                    ) : (
                                        <p className="mt-4 text-center text-gray-600 text-sm">
                                            Resend OTP in {timer}s
                                        </p>
                                    )}
                                </form>
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
                                        {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-300 ease-in-out shadow-md transform hover:scale-105 active:scale-95"
                                    >
                                        {loading ? "Processing..." : "Send OTP"}
                                    </button>
                                </form>
                            )
                        ) : (
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
                        )}
                    </>
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
        <div className="flex justify-center space-x-2 mb-4">
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
        </div>
    );
};

export default SignIn;
