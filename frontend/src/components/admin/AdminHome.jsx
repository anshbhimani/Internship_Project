import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import './AdminHome.css';

export const AdminHome = () => {
  const adminName = Cookies.get("name") || "Admin";
  const currentHour = new Date().getHours();
  let greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString());
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="admin-home">
      <h2>{greeting}, {adminName}!</h2>
      <p>{currentDate} - {currentTime}</p>
      <hr className="custom-hr"></hr>
      <p className="admin-message">Welcome to the Admin Dashboard. Manage developers and projects efficiently!</p>
    </div>
  );
};