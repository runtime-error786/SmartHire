import "../globals.css"; // Ensure global styles are imported

const Loader = () => {
    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-0 backdrop-blur-lg flex justify-center items-center z-50">
            <div className="w-24 h-24 border-8 border-solid border-gray-300 border-t-8 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );
};

export default Loader;
