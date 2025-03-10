import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AddTask } from "./AddTask";
import { TasksPage } from "../common/Tasks";
import AssignProjectToDevelopers from "./AssignProjectToDevelopers";
import axios from "axios";
import { API_BASE_URL } from "../../App";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, Typography } from "@mui/material";

export const ManagerDashboard = () => {
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [developers, setDevelopers] = useState([]);
  
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

  const fetchAvailableDevelopers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/managers/${managerId}/developers/`);
      setDevelopers(response.data);
    } catch (error) {
      console.error("Error fetching developers:", error);
    }
  };

  useEffect(() => {
    fetchManagerProjects();
    fetchAvailableDevelopers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome Manager</h1>

      {/* Project Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.length > 0 ? (
          projects.map((project) => (
            <Card key={project._id} className="shadow-md rounded-lg">
              <b>{project.title || "No title available"}</b> {/* Added fallback */}
              <CardContent>
                <p><strong>Pending Tasks:</strong> {project.pendingTasks || 0}</p>
                <p><strong>New Modules:</strong> {project.newModules || 0}</p>
                <p><strong>Status:</strong> {project.status || "Unknown"}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p>No projects available.</p>
        )}
      </div>

      <hr className="my-6" />
      
      {/* Render the selected component */}
      <div className="mt-4">
        {activeTab === "addDevelopers" && <AssignProjectToDevelopers />}
        {activeTab === "addTask" && <AddTask />}
        {activeTab === "viewTasks" && <TasksPage />}
      </div>
    </div>
  );
};
