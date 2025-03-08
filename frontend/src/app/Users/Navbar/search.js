"use client";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { search_bar_action,show_search } from "@/Redux/Action"; // Import your Redux action

const SearchBar = () => {
  const dispatch = useDispatch();

  // Optional: you can use the state from Redux if needed (search value in Redux store)
  const search = useSelector((state) => state.search_bar_reducer);

  // Handle input change to update the search term
  const handleInputChange = async(e) => {
    await dispatch(search_bar_action(e.target.value)); // Dispatch the action with the updated search term
  };
  const showSearch = useSelector((state) => state.show_search_reducer);
  
  if (!showSearch) {
    return null; // Don't render search bar if show_search_reducer is false
  }

  return (
    <div className="relative w-full md:w-64">
      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FontAwesomeIcon icon={faSearch} className="h-5 w-5 text-gray-400" />
      </span>
      <input
        className="pl-10 pr-4 py-2 border border-gray-600 rounded-lg text-sm text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        type="text"
        placeholder="Search"
        value={search} // Bind input value to the local state
        onChange={handleInputChange} // Handle input change event
      />
    </div>
  );
};

export { SearchBar };
