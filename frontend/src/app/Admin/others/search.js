"use client";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { admin_search_bar_action, search_bar_action, show_search } from "@/Redux/Action"; // Import your Redux action

const SearchBar = () => {
    const dispatch = useDispatch();

    // Optional: you can use the state from Redux if needed (search value in Redux store)
    const search = useSelector((state) => state.admin_search_bar_reducer);

    // Handle input change to update the search term
    const handleInputChange = async (e) => {
        await dispatch(admin_search_bar_action(e.target.value)); // Dispatch the action with the updated search term
    };
   

    return (
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-4">
            <input
                type="text"
                value={search}
                onChange={handleInputChange}
                placeholder="Search by email"
                className="px-6 py-4 rounded-lg  w-full sm:w-96 focus:outline-none focus:ring-2 focus:ring-blue-500 border-blue-300 border-2 text-black text-base placeholder:text-gray-500"
            />
        </div>
    );
};

export { SearchBar };
