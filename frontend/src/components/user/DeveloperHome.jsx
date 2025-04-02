import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import './DeveloperHome.css';

export const DeveloperHome = () => {
  const developerName = Cookies.get("name") || "Developer"; // Fallback if cookie is missing

  // Get current hour
  const currentHour = new Date().getHours();

  // Determine greeting
  let greeting;
  if (currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour < 18) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }

  // Get current date and time
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString());
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer); // Cleanup interval on component unmount
  }, []);

 
  const [motivationalMessage, setMotivationalMessage] = useState('');

  useEffect(() => {
    fetch(`/messages.txt?t=${new Date().getTime()}`)  // Prevents caching issues
      .then(response => response.text())
      .then(text => {
        const messages = text.split("\n").filter(msg => msg.trim() !== "");
        if (messages.length > 0) {
          const randomMessage = messages[Math.floor(Math.random() * messages.length)];
          setMotivationalMessage(randomMessage);
        }
      })
      .catch(error => console.error("Error fetching messages:", error));
  }, []);
  

  return (
    <div className="developer-home">
      <h2>{greeting}, {developerName}!</h2>
      <p>{currentDate} - {currentTime}</p>
      <hr className="custom-hr"></hr>
      <p className="motivational-text">{motivationalMessage}</p>
    </div>
  );
};
