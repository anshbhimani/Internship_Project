import './ManagerHome.css';
import Cookies from "js-cookie";
import React, { useState, useEffect } from "react";

export const ManagerHome = () => {
  const managerName = Cookies.get("name") || "Manager";
  const currentHour = new Date().getHours();
  let greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString());
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [motivationalMessage, setMotivationalMessage] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="manager-home">
      <h2>{greeting}, {managerName}!</h2>
      <p>{currentDate} - {currentTime}</p>
      <hr className="custom-hr"></hr>
      <p className="motivational-text">{motivationalMessage}</p>
    </div>
  );
};
