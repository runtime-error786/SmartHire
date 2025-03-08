"use client";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faRightLeft, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import "../../globals.css";
import { Role_Action } from "@/Redux/Action";
import Image from "next/image"; // Importing the Image component from Next.js

const DEFAULT_IMAGE = "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o="; 

const ProfileLink = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const dispatch = useDispatch();
  const router = useRouter();
  const userRole = useSelector((state) => state.Role_Reducer);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:3001/get_picture/', { withCredentials: true });
        setUserData(response.data); 
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const switchToRecruiter = async() => {
    await dispatch(Role_Action("Recruiter"));
    router.push("/Users/Home");
  };

  const switchToCandidate = async() => {
    await dispatch(Role_Action("Candidate"));
    router.push("/Users/Home");
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://127.0.0.1:3001/logout/', {}, { withCredentials: true });
      

      router.push('/Users/SignIn'); 
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 hover:bg-gray-200 text-gray-300 hover:text-white transition duration-300 p-2 rounded-lg "
        aria-label="Profile Menu"
      >
        <div className="relative w-10 h-10 md:w-12 md:h-12 lg:w-12 lg:h-12">
          <Image
            src={userData?.user_data?.profile_picture || DEFAULT_IMAGE} 
            alt="Profile"
            layout="fill" // Use 'fill' to cover the div, similar to object-fit: cover
            className="rounded-full border-2 border-gray-300 object-cover"
          />
        </div>
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg">
          <div className="py-2 px-4 border-b border-gray-700">
            <span className="text-white font-medium">
              Hello, {userData?.user_data?.first_name || "User"} 
            </span>
            <p className="text-sm text-gray-400">
              {userData?.user_data?.email}
            </p>
          </div>
          <button
            className="w-full px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white flex items-center space-x-2 transition duration-200"
            onClick={() => router.push("/Users/Profile")}
          >
            <FontAwesomeIcon icon={faUser} />
            <span>View Profile</span>
          </button>
          {userRole === "Candidate" ? (
            <button
              className="flex items-center space-x-2 w-full text-gray-300 hover:text-white px-4 py-2 transition duration-200 rounded-lg hover:bg-gray-700"
              onClick={switchToRecruiter}
            >
              <FontAwesomeIcon icon={faRightLeft} />
              <span>Switch to Recruiter</span>
            </button>
          ) : (
            <button
              className="flex items-center space-x-2 w-full text-gray-300 hover:text-white px-4 py-2 transition duration-200 rounded-lg hover:bg-gray-700"
              onClick={switchToCandidate}
            >
              <FontAwesomeIcon icon={faRightLeft} />
              <span>Switch to Candidate</span>
            </button>
          )}
          <hr className="my-1 border-gray-700" />
          <button
            className="w-full px-4 py-2 text-gray-300 hover:bg-red-600 hover:text-white flex items-center space-x-2 transition duration-200"
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Logout</span>
          </button>
          
        </div>
      )}
    </div>
  );
};

export { ProfileLink };


