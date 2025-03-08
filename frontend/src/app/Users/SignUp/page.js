"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import "../../globals.css";
import bgImage from "../../Photos/file.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { show_search,search_bar_action } from "@/Redux/Action";
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
            if (index < 5) inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            if (index > 0 && !otp[index]) inputRefs.current[index - 1].focus();
            if (index < 6) {
                setOtp((prev) => {
                    const newOtp = prev.split("");
                    newOtp[index] = "";
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
                    className="w-12 h-12 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0073b1]"
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
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewSrc, setPreviewSrc] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const fileInputRef = useRef(null);
    const router = useRouter();
    const dispatch = useDispatch();
    dispatch(show_search(false));
    dispatch(search_bar_action(""));

    useEffect(() => {
        let countdown;
        if (isOtpSent && timer > 0) {
            countdown = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            clearInterval(countdown);
            setErrors({ otp: "OTP expired. Please request a new one." });
        }
        return () => clearInterval(countdown);
    }, [isOtpSent, timer]);

    const validateForm = () => {
        const nameRegex = /^[A-Za-z]+$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        const newErrors = {};

        if (!nameRegex.test(firstName)) {
            newErrors.firstName = "First name should contain only letters.";
        }
        if (!nameRegex.test(lastName)) {
            newErrors.lastName = "Last name should contain only letters.";
        }
        if (!emailRegex.test(email)) {
            newErrors.email = "Please enter a valid email.";
        }
        if (!passwordRegex.test(password)) {
            newErrors.password = "Password must be at least 8 characters, with an uppercase letter, a digit, and a special character.";
        }
        if (!profilePicture) {
            newErrors.profilePicture = "Please upload a profile picture.";
        } else {
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validImageTypes.includes(profilePicture.type)) {
                newErrors.profilePicture = "Profile picture must be a JPG, PNG, or GIF.";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            await axios.post("http://127.0.0.1:3001/send_otp/", { email });
            setIsOtpSent(true);
            setTimer(60); // Reset timer for resend OTP
        } catch (error) {
            const apiMessage = error.response?.data?.message || "Error sending OTP.";
            setErrors((prevErrors) => ({ ...prevErrors, email: apiMessage }));
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        try {
            await axios.post("http://127.0.0.1:3001/send_otp/", { email });
            setTimer(60);  // Reset timer for resend OTP
            setErrors({});
            toast.success("OTP has been resent.");
        } catch (error) {
            toast.error("Error resending OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp || otp.length < 6) {
            setErrors({ otp: "Please enter the complete OTP." });
            return;
        }
        setLoading(true);
        try {
            await axios.post("http://127.0.0.1:3001/verify_otp/", { email, otp });
            await handleSignup(); // Call signup function after successful OTP verification
            setErrors("")
            setSuccessMessage("Signup successful!");
            
            setTimeout(() => router.push("/Users/SignIn"),0);
        } catch (error) {
            setErrors({ otp: error.response?.data?.message || "Invalid OTP." });
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async () => {
        const formData = new FormData();
        formData.append("first_name", firstName);
        formData.append("last_name", lastName);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("profile_picture", profilePicture);

        setLoading(true);
        try {
            await axios.post("http://127.0.0.1:3001/signup/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        } catch (error) {
            setErrors({ general: "Signup failed! Please try again." });
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

    const triggerFileSelect = () => fileInputRef.current.click();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F2EE] px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-[#FFFFFF] rounded-lg mt-12 shadow-2xl p-8 sm:p-10 max-w-lg w-full">
                <div className="text-center mb-8">
                    <img src={bgImage.src} alt="Brand Logo" className="w-20 h-20 rounded-full mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        {isOtpSent ? "Verify Your OTP" : "Create Your SmartHire Account"}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {isOtpSent ? "Enter the OTP sent to your email to complete your registration." : "Sign up to access all features and start your hiring journey with SmartHire!"}
                    </p>
                </div>

                {successMessage && (
                    <p className="text-green-500 text-center text-sm mb-4">{successMessage}</p>
                )}

                {!isOtpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="First Name"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0073b1]"
                            />
                            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                        </div>
                        <div>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Last Name"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0073b1]"
                            />
                            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                        </div>
                        <div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0073b1]"
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0073b1]"
                            />
                            <FontAwesomeIcon
                                icon={showPassword ? faEyeSlash : faEye}
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3 cursor-pointer text-gray-500"
                            />
                            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={triggerFileSelect}
                                className="w-full bg-[#0073b1] text-white py-3 rounded-lg hover:bg-[#005582] focus:outline-none shadow-lg"
                            >
                                Upload Profile Picture
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} hidden />
                            {errors.profilePicture && <p className="text-red-500 text-sm">{errors.profilePicture}</p>}
                        </div>
                        {previewSrc && (
                            <div className="mb-4">
                                <img src={previewSrc} alt="Profile Preview" className="w-24 h-24 rounded-full mx-auto mt-4" />
                            </div>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-[#0073b1] text-white py-3 rounded-lg hover:bg-[#005582] focus:outline-none shadow-lg"
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Sign Up"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp}>
                        <OtpInput otp={otp} setOtp={setOtp} />
                        {errors.otp && <p className="text-red-500 text-sm text-center">{errors.otp}</p>}
                        <button
                            type="submit"
                            className="w-full bg-[#0073b1] text-white py-3 rounded-lg hover:bg-[#005582] focus:outline-none shadow-lg"
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : `Verify OTP (${timer}s)`}
                        </button>
                        {timer === 0 && (
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                className="w-full bg-gray-200 text-[#0073b1] py-3 mt-2 rounded-lg focus:outline-none shadow-lg"
                            >
                                Resend OTP
                            </button>
                        )}
                    </form>
                )}
                <p className="mt-6 text-center text-gray-600 text-sm">
                    Already have an account?{" "}
                    <Link href="/Users/SignIn" className="text-[#0073b1] font-semibold hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
            <Toaster position="top-center" />
        </div>
    );
};

export default Signup;
