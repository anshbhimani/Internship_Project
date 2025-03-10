import { React, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AddTask } from "./AddTask";
import { TasksPage } from "../common/Tasks";
import AssignProjectToDevelopers from "./AssignProjectToDevelopers";
import axios from "axios";
import { API_BASE_URL } from "../../App";
import Cookies from "js-cookie";

export const ManagerDashboard = () => {
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [developers, setDevelopers] = useState([]);
  
  // Extract tab name from URL search params
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab");

  // Retrieve managerId from cookies
  const managerId = Cookies.get('managerId');

  const fetchManagerProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/managers/${managerId}/projects/`);
      console.log(response.data);
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchAvailableDevelopers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/managers/${managerId}/developers/`); // Assuming this endpoint returns the developers managed by the current manager
      setDevelopers(response.data);
    } catch (error) {
      console.error("Error fetching developers:", error);
    }
  };

  useEffect(() => {
    fetchManagerProjects();
    fetchAvailableDevelopers();
  }, []);

  const handleProjectSelect = (e) => {
    const selectedProjectId = e.target.value;
    const selected = projects.find(project => project._id === selectedProjectId);
    setSelectedProject(selected || null);
  };

  const handleAssignDevelopers = () => {
    if (!selectedProject) return;

    // Pass the selected project and developers to the AssignProjectToDevelopers component or API
    console.log("Assign developers to project", selectedProject, developers);
  };

  return (
    <div>
      <h1>Welcome Manager</h1>


      <hr />
      
      {/* Render the selected component below */}
      <div className="mt-4">
        {activeTab === "addDevelopers" && <AssignProjectToDevelopers />}
        {activeTab === "addTask" && <AddTask />}
        {activeTab === "viewTasks" && <TasksPage />}
      </div>
    </div>
  );
};
