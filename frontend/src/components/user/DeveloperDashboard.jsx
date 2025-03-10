import React,{useState,useEffect} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TasksPage } from "../common/Tasks";
import axios from 'axios';
import { API_BASE_URL } from "../../App";
import Cookies from "js-cookie";

export const DeveloperDashboard = () => {
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const developerId = Cookies.get("userId");
  
  useEffect(() => {
      const fetchProjects = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/developer/${developerId}`);
          setProjects(res.data); // Set projects from API
        } catch (error) {
          console.error("Error fetching projects:", error);
        }
      };
      fetchProjects();
    }, []);
  
  // Extract tab name from URL search params
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab");

  return (
    <div>
      <h1>Welcome Developer</h1>
      <hr/>
      {/* Render the selected component below */}
      <div className="mt-4">
        {activeTab === "viewTasks" && <TasksPage />}
      </div>
    </div>
  );
};
