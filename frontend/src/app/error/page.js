"use client";
import { useRouter } from 'next/navigation';
import { useSelector } from "react-redux";
import { FaExclamationTriangle } from 'react-icons/fa';

const ErrorPage = () => {
    const router = useRouter();
    const role = useSelector((state) => state.Role_Reducer);

    const handleGoHome = () => {
        if (role === 'admin') {
            router.push('/Admin/Home'); 
        } else {
            router.push('/Users/Home');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-4">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-xl border border-gray-300 transform transition-transform duration-300 hover:scale-105">
                <FaExclamationTriangle className="text-6xl text-yellow-600 mb-4 mx-auto" />
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Oops! Something went wrong.</h1>
                <p className="text-lg text-gray-600 mb-6">
                    We couldn't find the page you're looking for. Please check the URL or return to the home page.
                </p>
                <button 
                    onClick={handleGoHome} 
                    className="w-full px-6 py-3 bg-gray-800 text-white rounded-md shadow-md hover:bg-gray-700 transition duration-300 transform hover:scale-105">
                    Go Back to Home
                </button>
                
            </div>
        </div>
    );
};

export default ErrorPage;
