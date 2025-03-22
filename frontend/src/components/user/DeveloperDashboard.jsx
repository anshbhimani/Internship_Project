import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { TasksPage } from "../common/Tasks";
import axios from "axios";
import { API_BASE_URL } from "../../App";
import Cookies from "js-cookie";
import { DeveloperHome } from "./DeveloperHome";
import { DeveloperProjects } from "./DeveloperProjects";

export const DeveloperDashboard = () => {
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const developerId = Cookies.get("userId"); // Fetch the userId from cookies

  useEffect(() => {
    if (developerId) {
      const fetchProjects = async () => {
        try {
          setLoading(true); // Set loading to true before API call
          const url = `${API_BASE_URL}/developer/${developerId}`;
          const res = await axios.get(url);
          setProjects(res.data); // Set projects from API
        } catch (error) {
          if (error.response && error.response.status === 404) {
            setError("No projects are assigned to this developer");
          } else {
            setError("Error fetching projects");
          }
        } finally {
          setLoading(false); // Set loading to false once data is fetched or on error
        }
      };

      fetchProjects();
    } else {
      setError("Developer ID is not available");
      setLoading(false);
    }
  }, [developerId]);

  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab");

  return (
    <div>
      {loading && <p>Loading projects...</p>}
      <div className="mt-4">
        {activeTab === "home" && <DeveloperHome/>}
        {activeTab === "viewTasks" && <TasksPage projects={projects} />}
        {activeTab === "viewProjects" && <DeveloperProjects />} 
      </div>
    </div>
  );
};
