"use client"; // For client-side rendering

import { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:3001/api/hello/");
        setMessage(response.data.message);
      } catch (error) {
        console.error("Error fetching message:", error);
      }
    };

    fetchMessage();
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <h1 style={{ fontSize: "48px", fontWeight: "bold" }}>
        {message || "Loading..."}
      </h1>
    </div>
  );
};

export default Home;
