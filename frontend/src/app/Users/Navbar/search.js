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

const SearchBar = () => (
    <div className="relative w-full md:w-64">
      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FontAwesomeIcon icon={faSearch} className="h-5 w-5 text-gray-400" />
      </span>
      <input
        className="pl-10 pr-4 py-2 border border-gray-600 rounded-lg text-sm text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        type="text"
        placeholder="Search"
      />
    </div>
  );

export {SearchBar}