"use client";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Image from "next/image";

const Profile = () => {
  const role = useSelector((state) => state.Role_Reducer);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNo: "",
    location: "",
    country: "",
    skills: "",
    education: "",
    linkedIn: "",
    github: "",
    bio: "",
    companyName: "",
    website: "",
    profilePicture: null,
    role: role,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [profilePicturePreview, setProfilePicturePreview] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:3001/profile/`, { withCredentials: true });
        const data = response.data;

        setFormData({
          firstName: data.profile.first_name || "",
          lastName: data.profile.last_name || "",
          email: data.email || "",
          contactNo: data.profile.phone_number || "",
          location: data.profile.city || "",
          country: data.profile.country || "",
          skills: data.candidate ? data.candidate.skills : "",
          education: data.candidate ? data.candidate.education : "",
          linkedIn: data.profile.linkedin_link || "",
          github: data.candidate ? data.candidate.github_link : "",
          bio: data.candidate ? data.candidate.experience : "",
          companyName: data.recruiter ? data.recruiter.company_name : "",
          website: data.recruiter ? data.recruiter.company_website : "",
          profilePicture: data.profile.profile_picture || null,
        });

        if (data.profile.profile_picture) {
          setProfilePicturePreview(data.profile.profile_picture);
        }

        setLoading(false);
      } catch (error) {
        setError("Error loading profile data.");
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const validateField = (name, value) => {
    const fieldErrors = {};
    switch (name) {
      case "firstName":
      case "lastName":
        if (!value) fieldErrors[name] = "This field is required.";
        else if (!/^[A-Za-z]+$/.test(value)) fieldErrors[name] = "Only alphabetic characters allowed.";
        break;
      case "contactNo":
        if (value && !/^\d{11}$/.test(value)) fieldErrors[name] = "Phone number must be 11 digits.";
        break;
      case "linkedIn":
      case "github":
      case "website":
        if (value && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(value)) fieldErrors[name] = "Invalid URL format.";
        break;
      case "companyName":
        if (value && !/^[A-Za-z\s]+$/.test(value)) fieldErrors[name] = "Only alphabetic characters allowed.";
        break;
      case "country":
        if (value && !/^[A-Za-z\s]+$/.test(value)) fieldErrors[name] = "Only alphabetic characters allowed.";
        break;
      default:
        break;
    }
    return fieldErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({
      ...errors,
      ...validateField(name, value),
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      profilePicture: file,
    });
    setProfilePicturePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    ["firstName", "lastName"].forEach(field => {
      const fieldErrors = validateField(field, formData[field]);
      if (Object.keys(fieldErrors).length > 0) {
        newErrors[field] = fieldErrors[field];
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const formDataToSubmit = new FormData();
    formDataToSubmit.append("role", role);
    formDataToSubmit.append("first_name", formData.firstName);
    formDataToSubmit.append("last_name", formData.lastName);
    formDataToSubmit.append("phone_number", formData.contactNo);
    formDataToSubmit.append("city", formData.location);
    formDataToSubmit.append("country", formData.country);
    formDataToSubmit.append("linkedin_link", formData.linkedIn);
    if (formData.github) formDataToSubmit.append("github_link", formData.github);
    if (formData.bio) formDataToSubmit.append("bio", formData.bio);
    if (formData.profilePicture) formDataToSubmit.append("profile_picture", formData.profilePicture);

    if (role === "Candidate") {
      formDataToSubmit.append("skills", formData.skills);
      formDataToSubmit.append("education", formData.education);
    } else if (role === "Recruiter") {
      formDataToSubmit.append("company_name", formData.companyName);
      formDataToSubmit.append("company_website", formData.website);
    }

    try {
      await axios.put(`http://127.0.0.1:3001/update_profile/`, formDataToSubmit, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setSuccessMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Error updating profile.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen flex justify-center items-center mt-10" style={{ backgroundColor: "#F4F2EE" }}>
      <div className="bg-white p-8 rounded-lg shadow-sm max-w-4xl w-full mx-5 md:mx-10 lg:mx-20 border border-gray-200">
        <div className="text-center mb-8">
          {profilePicturePreview && (
            <label htmlFor="profilePictureUpload" className="block">
              <Image
                src={profilePicturePreview}
                alt="Profile"
                width={96}
                height={96}
                className="rounded-full border-2 border-gray-300 object-cover mx-auto"
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
            {[
              { name: "firstName", label: "First Name", placeholder: "", type: "text" },
              { name: "lastName", label: "Last Name", placeholder: "", type: "text" },
              { name: "email", label: "Email", placeholder: "", type: "email", readOnly: true },
              { name: "contactNo", label: "Contact No", placeholder: "", type: "text" },
              { name: "location", label: "Location", placeholder: "Enter your city", type: "text" },
              { name: "country", label: "Country", placeholder: "Enter your country", type: "text" },
              { name: "linkedIn", label: "LinkedIn Profile", placeholder: "Enter LinkedIn URL", type: "url" },
              { name: "github", label: "GitHub Profile", placeholder: "Enter GitHub URL", type: "url", show: role === "Candidate" },
              { name: "skills", label: "Skills", placeholder: "Enter your skills", type: "text", show: role === "Candidate" },
              { name: "education", label: "Education", placeholder: "", type: "textarea", show: role === "Candidate" },
              { name: "companyName", label: "Company Name", placeholder: "", type: "text", show: role === "Recruiter" },
              { name: "website", label: "Company Website", placeholder: "", type: "url", show: role === "Recruiter" },
            ].map(({ name, label, placeholder, type, readOnly, show = true }) => (
              show && (
                <div key={name}>
                  <label className="block text-gray-700 text-sm mb-1">{label}</label>
                  {type !== "textarea" ? (
                    <input
                      type={type}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      readOnly={readOnly}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    />
                  ) : (
                    <textarea
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  )}
                  {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
                </div>
              )
            ))}

            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm mb-1">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="4"
                placeholder="Tell us something about yourself"
              />
            </div>
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
