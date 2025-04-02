import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Cookies from "js-cookie";  // Import js-cookie
import "./UserSidebar.css";

export const UserSidebar = ({ userRole, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract active tab from URL
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab");

  const handleLogout = () => {
    // Clear cookies on logout
    Cookies.remove("userId");
    Cookies.remove("role");
    
    localStorage.clear()
    // Optionally, redirect the user to the login page
    navigate("/login"); // Adjust the route if necessary
    onLogout(); // Call the onLogout function to notify parent component (if needed)
  };

  return (
    <div className={`sidebar bg-dark text-white p-3 ${isCollapsed ? "collapsed" : ""}`}>
      <button className="btn btn-light mb-3" onClick={() => setIsCollapsed(!isCollapsed)}>
        ⮞
      </button>

      <ul className="list-unstyled">
        <li>
          <Link to={`/profile/${userRole}?tab=home`} className={`d-block text-white p-2 ${activeTab === "addProject" ? "fw-bold" : ""}`}>
            Home
          </Link>
        </li>
        {userRole === "admin" && (
          <>
          <li>
              <Link to="?tab=users" className={`d-block text-white p-2 ${activeTab === "users" ? "fw-bold" : ""}`}>
                List Users
              </Link>
            </li>
           <li>
              <Link to="?tab=addUser" className={`d-block text-white p-2 ${activeTab === "addUser" ? "fw-bold" : ""}`}>
                Add User
              </Link>
            </li>
            <li>
              <Link to="?tab=addProject" className={`d-block text-white p-2 ${activeTab === "addProject" ? "fw-bold" : ""}`}>
                Add Project
              </Link>
            </li>
            <li>
              <Link to="?tab=listProjects" className={`d-block text-white p-2 ${activeTab === "listProjects" ? "fw-bold" : ""}`}>
                List Projects
              </Link>
            </li>
            <li>
              <Link to="?tab=addDevelopers" className={`d-block text-white p-2 ${activeTab === "addDevelopers" ? "fw-bold" : ""}`}>
                Add Developers
              </Link>
            </li>
            <li>
              <Link to="?tab=manageModules" className={`d-block text-white p-2 ${activeTab === "addModule" ? "fw-bold" : ""}`}>
                Manage Modules
              </Link>
            </li>
            <li>
              <Link to="?tab=addTask" className={`d-block text-white p-2 ${activeTab === "addTask" ? "fw-bold" : ""}`}>
                Add Task
              </Link>
            </li>
          </>
        )}
        {userRole === "manager" && (
          <>
            
            <li>
              <Link to="?tab=viewProjects" className={`d-block text-white p-2 ${activeTab === "viewProjects" ? "fw-bold" : ""}`}>
                View Projects
              </Link>
            </li>
            <li>
              <Link to="?tab=assignTask" className={`d-block text-white p-2 ${activeTab === "assignTask" ? "fw-bold" : ""}`}>
                Assign Task
              </Link>
            </li>
            <li>
              <Link to="?tab=viewTasks" className={`d-block text-white p-2 ${activeTab === "viewTasks" ? "fw-bold" : ""}`}>
                View Tasks
              </Link>
            </li>
          </>
        )}
       {userRole === "developer" && (
          <>
            <li>
              <Link to="?tab=viewTasks" className={`d-block text-white p-2 ${activeTab === "viewTasks" ? "fw-bold" : ""}`}>
                View Tasks
              </Link>
            </li>
            <li>
              <Link to="?tab=viewProjects" className={`d-block text-white p-2 ${activeTab === "viewProjects" ? "fw-bold" : ""}`}>
                View Projects
              </Link>
            </li>
          </>
        )}
        <li>
          <button className="logout btn btn-danger mt-3" onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};
