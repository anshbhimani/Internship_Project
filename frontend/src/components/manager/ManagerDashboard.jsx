import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AddTask } from "./AddTask";
import { TasksPage } from "../common/Tasks";
import AssignProjectToDevelopers from "./AssignProjectToDevelopers";
import axios from "axios";
import { API_BASE_URL } from "../../App";
import Cookies from "js-cookie";
import { Projects } from "./Projects";
import { AssignTask } from "./AssignTask";
import { AddModule } from "./AddModule";

export const ManagerDashboard = () => {
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  
  // Extract tab name from URL search params
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab");

  // Retrieve managerId from cookies
  const managerId = Cookies.get("managerId");

  const fetchManagerProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/managers/${managerId}/projects/`);
      console.log("Projects fetched:", response.data);  // Log to check if the title is coming through
      setProjects(response.data);
      
      // Fetch tasks for each project after projects are loaded
      response.data.forEach((project) => {
        fetchProjectTasks(project._id); // Assuming project._id is correct
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchProjectTasks = async (projectId) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/tasks/${projectId}`);
        console.log("Tasks for project", projectId, ":", response.data);
      } catch (error) {
        console.error("Error fetching project tasks:", error);
      }
    };

  useEffect(() => {
    fetchManagerProjects();
  }, []);



  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome Manager</h1>

      
      <hr className="my-6" />
      
      {/* Render the selected component */}
      <div className="mt-4">
        {activeTab === "addDevelopers" && <AssignProjectToDevelopers />}
        {activeTab === "addTask" && <AddTask />}
        {activeTab === "viewTasks" && <TasksPage />}
        {activeTab === "viewProjects" && <Projects/>}
        {activeTab === "assignTask" && <AssignTask/>}
        {activeTab === "addModule" && <AddModule/>}
      </div>
    </div>
  );
};
