import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./UserSidebar.css";

export const UserSidebar = ({ userRole, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // Extract active tab from URL
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab");

  return (
    <div className={`sidebar bg-dark text-white p-3 ${isCollapsed ? "collapsed" : ""}`}>
      <button className="btn btn-light mb-3" onClick={() => setIsCollapsed(!isCollapsed)}>
        ⮞
      </button>
      

      <ul className="list-unstyled">
          <li>
            <Link to={`/profile/${userRole}`} className={`d-block text-white p-2 ${activeTab === "addProject" ? "fw-bold" : ""}`}>
                Home
              </Link>
          </li>
        {userRole === "admin" && (
          <>
            <li>
              <Link to="?tab=addProject" className={`d-block text-white p-2 ${activeTab === "addProject" ? "fw-bold" : ""}`}>
                Add Project
              </Link>
            </li>
          </>
        
        )}
        {userRole === "manager" && (
          <>
            <li>
              <Link to="?tab=addDevelopers" className={`d-block text-white p-2 ${activeTab === "addDevelopers" ? "fw-bold" : ""}`}>
                Add Developers
              </Link>
            </li>
            <li>
              <Link to="?tab=viewProjects" className={`d-block text-white p-2 ${activeTab === "viewProjects" ? "fw-bold" : ""}`}>
                View Projects
              </Link>
            </li>
            <li>
              <Link to="?tab=addTask" className={`d-block text-white p-2 ${activeTab === "addTask" ? "fw-bold" : ""}`}>
                Add Task
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
          <li>
            <Link to="?tab=viewTasks" className={`d-block text-white p-2 ${activeTab === "viewTasks" ? "fw-bold" : ""}`}>
              View Tasks
            </Link>
          </li>
        )}
        <li>
          <button className="logout btn btn-danger mt-3" onClick={onLogout}>
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};
