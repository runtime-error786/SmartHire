"use client";

import { useState, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import "../../globals.css";
import bgImage from "../../Photos/bg.png";

const OtpInput = ({ otp, setOtp }) => {
    const inputRefs = useRef([]);

    const handleChange = (e, index) => {
        const value = e.target.value;

        if (value.length > 0) {
            setOtp((prev) => {
                const newOtp = prev.split("");
                newOtp[index] = value;
                return newOtp.join("");
            });

            // Move focus to the next input if the current input is filled
            if (index < 5) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            if (index > 0 && !otp[index]) {
                // If the current input is empty, focus on the previous input
                inputRefs.current[index - 1].focus();
            }
            if (index < 6) {
                // Clear the current input value
                setOtp((prev) => {
                    const newOtp = prev.split("");
                    newOtp[index] = "";  // Clear current input
                    return newOtp.join("");
                });
            }
        }
    };

    return (
        <div className="flex justify-center space-x-2 mb-4">
            {Array(6).fill().map((_, index) => (
                <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={otp[index] || ""}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="w-12 h-12 text-center border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            ))}
        </div>
    );
};

const Signup = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewSrc, setPreviewSrc] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const passwordRegex = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    const validateForm = () => {
        // Check if all fields are filled
        if (!firstName || !lastName || !email || !password || !profilePicture) {
            toast.error("All fields are required.");
            return false;
        }
    
        // First name and last name validation
        const nameRegex = /^[A-Za-z]+$/;
        if (!nameRegex.test(firstName) || firstName.length < 2 || firstName.length > 30) {
            toast.error("First name must contain only letters and be 2-30 characters long.");
            return false;
        }
    
        if (!nameRegex.test(lastName) || lastName.length < 2 || lastName.length > 30) {
            toast.error("Last name must contain only letters and be 2-30 characters long.");
            return false;
        }
    
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address.");
            return false;
        }
    
        // Password validation
        const passwordRegex = /^(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(password)) {
            toast.error("Password must be at least 8 characters long, contain one uppercase letter, one digit, and one special character.");
            return false;
        }
    
        // Profile picture validation
        if (profilePicture) {
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validImageTypes.includes(profilePicture.type)) {
                toast.error("Profile picture must be a JPG, PNG, or GIF.");
                return false;
            }
    
            const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
            if (profilePicture.size > maxSizeInBytes) {
                toast.error("Profile picture must be less than 2MB.");
                return false;
            }
        }
    
        return true;
    };
    

    const handleSendOtp = async (e) => {
        e.preventDefault();
    
        if (!validateForm()) {
            return; 
        }

        setLoading(true);
        try {
            const response = await axios.post("http://localhost:8000/send_otp/", { email });
            toast.success(response.data.message);
            setIsOtpSent(true);
        } catch (error) {
            toast.error(error.response?.data?.message || "Error sending OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:8000/verify_otp/", { email, otp });
            toast.success(response.data.message);
            handleSignup();
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewSrc(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSignup = async () => {
        if (!validateForm()) return;
    
        const formData = new FormData();
        formData.append("first_name", firstName);
        formData.append("last_name", lastName);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("profile_picture", profilePicture);
    
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:8000/signup/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                },
            });
            toast.success(response.data.message);
            
            setFirstName("");
            setLastName("");
            setEmail("");
            setPassword("");
          //setOtp("");
            setProfilePicture(null);
            //setPreviewSrc("");
            //setIsOtpSent(false); 
        } catch (error) {
            toast.error("Signup failed! Please try again.");
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };
    
    const triggerFileSelect = () => fileInputRef.current.click();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 px-4 sm:px-6 lg:px-8 mt-10 py-10">
            <div className="bg-white rounded-lg shadow-2xl p-8 sm:p-10 max-w-md w-full transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-blue-200">
                <div className="text-center mb-6">
                    <img src={bgImage.src} alt="Brand Logo" className="w-16 sm:w-20 mx-auto mb-4" />
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                        {isOtpSent ? "Verify OTP" : "Create Your Account"}
                    </h1>
                    <p className="mt-2 text-gray-600 text-sm sm:text-base">
                        {isOtpSent ? "Enter the OTP sent to your email." : "Fill in the details to sign up."}
                    </p>
                </div>

                {!isOtpSent ? (
                    <form onSubmit={handleSendOtp}>
                        <input
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            className="mb-4 w-full px-4 py-3 border rounded-lg"
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className="mb-4 w-full px-4 py-3 border rounded-lg"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mb-4 w-full px-4 py-3 border rounded-lg"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mb-4 w-full px-4 py-3 border rounded-lg"
                        />

                        <button
                            type="button"
                            onClick={triggerFileSelect}
                            className="mb-4 w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 rounded-lg border border-blue-700 hover:bg-gradient-to-l focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg transition duration-300 transform hover:scale-105"
                        >
                            Choose Profile Picture
                        </button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            style={{ display: "none" }}
                        />
                        {previewSrc && (
                            <div className="mb-4">
                                <img
                                    src={previewSrc}
                                    alt="Profile Preview"
                                    className="w-24 h-24 rounded-full mx-auto object-cover"
                                />
                            </div>
                        )}



                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp}>
                        <OtpInput otp={otp} setOtp={setOtp} />
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </form>
                )}
            </div>
            <Toaster />
        </div>
    );
};

export default Signup;