// components/Loader.js
import "../globals.css"; // Ensure global styles are imported

const Loader = () => {
    return (
        <div className="flex justify-center items-center min-h-screen bg-white">
            <div className="relative flex items-center justify-center w-32 h-32">
                {/* Rotating Outer Ring with Shadow */}
                <div className="absolute w-full h-full rounded-full border-4 border-transparent 
                                border-l-gray-400 animate-spin shadow-lg transition-all duration-300"></div>

                {/* Expanding Circle with Radiating Effect */}
                <div className="absolute w-24 h-24 rounded-full border-2 border-gray-300 
                                animate-ping opacity-60"></div>

                {/* Medium Circle with Fading Effect */}
                <div className="absolute w-16 h-16 rounded-full border-2 border-gray-500 
                                animate-ping opacity-50"></div>

                {/* Core Dot with Radiating Effect */}
                <div className="w-8 h-8 bg-gray-600 rounded-full 
                                animate-pulse shadow-lg transition-transform duration-200 
                                transform hover:scale-110"></div>
            </div>
        </div>
    );
};

export default Loader;
