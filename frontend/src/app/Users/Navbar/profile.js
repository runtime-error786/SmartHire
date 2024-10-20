"use client";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBriefcase,
  faBell,
  faUserGraduate,
  faSearch,
  faUser,
  faRightLeft,
  faSignOutAlt,
  faSignInAlt
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import "../../globals.css";
import { Role_Action } from "@/Redux/Action";

const ProfileLink = ({ router }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const toggleDropdown = () => setDropdownOpen((prev) => !prev);
    const dispatch = useDispatch();
    const userRole = useSelector((state) => state.Role_Reducer); 
  
    const switchToRecruiter = () => {
      dispatch(Role_Action('Recruiter')); 
      router.push('/Users/Home');
    };
  
    const switchToCandidate = () => {
      dispatch(Role_Action('Candidate')); 
      router.push('/Users/Home'); 
    };
  
  
    return (
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="flex items-center space-x-2 text-gray-300 hover:text-white transition duration-300 p-2 rounded-lg hover:bg-gray-700"
          aria-label="Profile Menu"
        >
          <img
            src="/profile.jpg"
            alt="Profile"
            className="h-10 w-10 rounded-full border-2 border-gray-300"
          />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg">
            <div className="py-2 px-4 border-b border-gray-700">
              <span className="text-white font-medium">Hello, musu</span>
              <p className="text-sm text-gray-400">mustafa@gmail.com</p>
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
              onClick={() => router.push("/logout")}
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    );
  };
  

export {ProfileLink}