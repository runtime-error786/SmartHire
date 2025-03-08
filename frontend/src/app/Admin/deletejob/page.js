"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { admin_search_bar_action } from "@/Redux/Action";
import { SearchBar } from "../others/search";
const Deljobs = () => {
  const [jobs, setjobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [debouncedQuery, setDebouncedQuery] = useState(""); // Debounced query
  const [showModal, setShowModal] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);
  const searchQuery = useSelector((state) => state.admin_search_bar_reducer);
  const dispatch = useDispatch();
  // Debounce logic
  const fetchSubscriptions = async (pageNumber = 1, search = searchQuery) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://127.0.0.1:3001/all_jobs/?page=${pageNumber}&name=${search}`,
        { withCredentials: true }
      );

      const totalPages = Math.ceil(response.data.count / 10);

      // Update state with response data
      setjobs(response.data.results.jobs);
      setTotalPages(totalPages);
      setTotalCount(response.data.count);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch users: " + err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions(page,searchQuery );
  }, [page]);

  useEffect(() => {
    fetchSubscriptions(1, searchQuery);
    setPage(1);
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

 

  

  const deleteUser = async () => {
    try {
      await axios.delete(`http://127.0.0.1:3001/job/${subscriptionToDelete.id}/`, {
        withCredentials: true,
      });
      setShowModal(false);
      fetchSubscriptions(page, searchQuery);
    } catch (err) {
      setError("Error deleting user: " + err.message);
    }
  };

  const openModal = (user) => {
    setSubscriptionToDelete(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSubscriptionToDelete(null);
  };

  return (
    <div className="pt-8 pe-4 pl-4 md:p-12 rounded-3xl mx-auto mt-12" style={{ backgroundColor: "#F4F2EE" }}>
      {/* Search Bar */}
      <SearchBar></SearchBar>

      {/* Users Table */}
      <div className="overflow-x-auto shadow-lg sm:rounded-2xl bg-white">
        <table className="w-full table-auto mb-10 border-collapse">
          <thead className="bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 text-black">
            <tr>
              <th className="px-6 py-4 text-base text-left font-medium">ID</th>
              <th className="px-6 py-4 text-base text-left font-medium">Title</th>
              <th className="px-6 py-4 text-base text-left font-medium">Skills</th>
              <th className="px-6 py-4 text-base text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((jobs) => (
              <tr key={jobs.id} className="border-b border-gray-200 hover:bg-blue-50 transition duration-300 transform hover:scale-102">
                <td className="px-6 py-4 text-base text-black-600">{jobs.id}</td>
                <td className="px-6 py-4 text-base text-black-600">{jobs.job_name}</td>
                <td className="px-6 py-4 text-base text-black-600">{jobs.skills}</td>

                <td className="px-6 py-4 text-base text-center">
                  <button
                    onClick={() => openModal(jobs)}
                    className="px-6 py-3 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 transform hover:scale-105"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center space-x-8 mb-12 mt-12">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className={`px-6 py-3 rounded-lg ${page <= 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
        >
          Previous
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className={`px-6 py-3 rounded-lg ${page >= totalPages ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
        >
          Next
        </button>
      </div>

      {/* Modal for Confirm Deletion */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 transition-opacity duration-200">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-96 max-w-sm">
            <h3 className="text-2xl font-semibold text-blue-700">Confirm Deletion</h3>
            <p className="text-base text-gray-700 mt-4">Are you sure you want to delete this Job?</p>
            <div className="flex justify-end mt-8 space-x-6">
              <button
                onClick={closeModal}
                className="px-6 py-3 text-base text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition duration-150"
              >
                Cancel
              </button>
              <button
                onClick={deleteUser}
                className="px-6 py-3 text-base text-white bg-red-600 rounded-md hover:bg-red-700 transition duration-150"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deljobs;
