"use client";
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const Profile = () => {
  const role = useSelector((state) => state.Role_Reducer); // Access the current role from Redux state

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNo: '',
    location: '',
    country: '',
    bio: '',
    linkedIn: '',
    github: '',
    portfolio: '',
    skills: '',
    education: '',
    companyName: '', // Recruiter-specific field
    website: '', // Recruiter-specific field
    profilePicture: null, // For loading the profile picture from backend
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(''); // For showing success message after update
  const [profilePicturePreview, setProfilePicturePreview] = useState(''); // Preview of profile picture

  // Fetch profile data on component load
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/profile/1/`);
        const data = response.data;

        // Populate form data based on the role
        setFormData({
          firstName: data.profile.first_name || '',
          lastName: data.profile.last_name || '',
          email: data.user.email || '',
          contactNo: data.profile.phone_number || '',
          location: data.profile.city || '',
          country: data.profile.country || '',
          bio: data.profile.experience || '',
          linkedIn: data.profile.linkedin_link || '',
          github: data.candidate?.github_link || '',
          portfolio: '', // Assuming this comes from some other source
          skills: data.candidate?.skills || '',
          education: data.candidate?.education || '',
          companyName: data.recruiter?.company_name || '',
          website: data.recruiter?.company_website || '',
          profilePicture: data.profile.profile_picture || null,
        });

        setProfilePicturePreview(`http://localhost:8000${data.profile.profile_picture}`); // Set the profile picture preview

        setLoading(false);
      } catch (error) {
        setError('Error loading profile data.');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      profilePicture: file,
    });
    setProfilePicturePreview(URL.createObjectURL(file)); // Preview the new profile picture
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSubmit = new FormData(); // Use FormData to handle file uploads
    formDataToSubmit.append('user[email]', formData.email);
    formDataToSubmit.append('profile[first_name]', formData.firstName);
    formDataToSubmit.append('profile[last_name]', formData.lastName);
    formDataToSubmit.append('profile[phone_number]', formData.contactNo);
    formDataToSubmit.append('profile[experience]', formData.bio);
    formDataToSubmit.append('profile[city]', formData.location);
    formDataToSubmit.append('profile[country]', formData.country);
    formDataToSubmit.append('profile[linkedin_link]', formData.linkedIn);
    formDataToSubmit.append('profile_picture', formData.profilePicture); // Add the profile picture file

    if (role === 'Candidate') {
      formDataToSubmit.append('candidate[github_link]', formData.github);
      formDataToSubmit.append('candidate[skills]', formData.skills);
      formDataToSubmit.append('candidate[education]', formData.education);
    } else if (role === 'Recruiter') {
      formDataToSubmit.append('recruiter[company_name]', formData.companyName);
      formDataToSubmit.append('recruiter[company_website]', formData.website);
    }

    try {
      const response = await axios.put(`http://localhost:8000/profile/1/`, formDataToSubmit, {
        headers: { 'Content-Type': 'multipart/form-data' }, // Set headers for file upload
      });
      console.log('Profile updated:', response.data);
      setSuccessMessage('Profile updated successfully!'); // Set success message
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error updating profile.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen flex justify-center items-center mt-16" style={{ backgroundColor: '#F4F2EE' }}>
      <div className="bg-white p-8 rounded-lg shadow-sm max-w-4xl w-full mx-5 md:mx-10 lg:mx-20 border border-gray-200">
        <div className="text-center mb-8">
          {/* Display profile picture with option to upload a new one */}
          {profilePicturePreview && (
            <label htmlFor="profilePictureUpload" className="block">
              <img
                className="w-24 h-24 rounded-full mx-auto shadow-sm border-2 border-gray-300 cursor-pointer"
                src={profilePicturePreview}
                alt="Profile"
              />
              <input
                type="file"
                id="profilePictureUpload"
                name="profilePicture"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
          <h2 className="mt-4 text-3xl font-semibold text-gray-800">Manage Your Profile</h2>
          <p className="text-gray-500">Keep your profile up-to-date for better opportunities!</p>
        </div>

        {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                placeholder="Enter your first name"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                placeholder="Enter your last name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 bg-gray-100 cursor-not-allowed"
                placeholder="Enter your email"
                readOnly
              />
            </div>

            {/* Contact No */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">
                Contact No
              </label>
              <input
                type="text"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                placeholder="Enter your contact number"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                placeholder="Enter your city"
                required
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                placeholder="Enter your country"
                required
              />
            </div>

            {/* Conditionally render fields based on role */}
            {role === 'Candidate' && (
              <>
                {/* Bio */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm mb-1">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                    placeholder="Tell us something about yourself"
                    rows="4"
                  />
                </div>

                {/* LinkedIn Profile */}
                <div>
                  <label className="block text-gray-700 text-sm mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    name="linkedIn"
                    value={formData.linkedIn}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                    placeholder="Enter your LinkedIn profile URL"
                  />
                </div>

                {/* GitHub Profile */}
                <div>
                  <label className="block text-gray-700 text-sm mb-1">
                    GitHub Profile URL
                  </label>
                  <input
                    type="url"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                    placeholder="Enter your GitHub profile URL"
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-gray-700 text-sm mb-1">
                    Skills
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                    placeholder="Enter your skills"
                  />
                </div>

                {/* Education */}
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm mb-1">
                    Education
                  </label>
                  <textarea
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                    placeholder="Enter your education details"
                    rows="3"
                  />
                </div>
              </>
            )}

            {role === 'Recruiter' && (
              <>
                {/* Company Name */}
                <div>
                  <label className="block text-gray-700 text-sm mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                    placeholder="Enter your company name"
                    required
                  />
                </div>

                {/* Company Website */}
                <div>
                  <label className="block text-gray-700 text-sm mb-1">
                    Company Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                    placeholder="Enter your company website"
                    required
                  />
                </div>
              </>
            )}
          </div>

          <div className="text-center mt-8">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-5 rounded-md hover:bg-blue-700 transition-all duration-300 shadow-sm"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
