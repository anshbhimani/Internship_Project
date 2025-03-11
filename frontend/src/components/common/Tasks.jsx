import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { API_BASE_URL } from "../../App";
import Cookies from "js-cookie";

export const TasksPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(""); // Now it's just a string (project title)
  const [tasks, setTasks] = useState([]);
  const [role, setRole] = useState(""); // Add role to handle developer/manager distinction
  const userId = Cookies.get("userId"); // Assuming you store developerId as well
  const [userTaskAssignments, setUserTaskAssignments] = useState({}); // Store user-task assignments by taskId
  const [taskModules, setTaskModules] = useState({});

  useEffect(() => {
    const userRole = Cookies.get('role'); // Assuming role is saved in cookies
    setRole(userRole); // Set the role of the user (either manager or developer)
    console.log("User Role : ", userRole);
    
    const fetchProjects = async () => {
      try {
        let res;
        if (userRole === "manager") {
          res = await axios.get(`${API_BASE_URL}/managers/${userId}/projects/`);
        } else if (userRole === "developer") {
          res = await axios.get(`${API_BASE_URL}/developer/${userId}/`);
        }

        console.log(res.data);
        setProjects(res.data); // Set the projects based on the user role
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, [userId, role]);

  useEffect(() => {
    if (selectedProject) {
      console.log("Selected Project : ", selectedProject);

      const fetchTasks = async () => {
        try {
          let res;
          if (role === "manager") {
            res = await axios.get(`${API_BASE_URL}/tasks/${selectedProject._id}`);
          } else if (role === "developer") {
            res = await axios.get(`${API_BASE_URL}/tasks/developer/${userId}/${selectedProject.project_id}`);
          }
          const taskList = res.data;

          // Fetch user details for each task
          const userAssignments = {};
          for (let task of taskList) {
            const userRes = await axios.get(`${API_BASE_URL}/user-tasks/task/${task._id}`);
            userAssignments[task._id] = userRes.data.map(user => user.full_name);
            
            if (task.module_id) {
              try {
                const moduleRes = await axios.get(`${API_BASE_URL}/modules/modules/${task.module_id}`);
                taskModules[task._id] = moduleRes.data.moduleName;
              } catch (moduleError) {
                console.error(`Error fetching module for task ${task._id}:`, moduleError);
                taskModules[task._id] = "Unknown Module"; // Default if error occurs
              }
            }
          }

          setUserTaskAssignments(userAssignments); // Store the assignments by taskId
          setTasks(taskList); // Set tasks after fetching user assignments
          setTaskModules(taskModules); 
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
      };
      fetchTasks();
    }
  }, [selectedProject, role, userId]);

  const handleProjectChange = (e) => {
    const selected = projects.find(project => project.title === e.target.value); 
    setSelectedProject(selected); // Store the entire project object
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-center mb-3">Tasks</h2>

          {/* Dropdown to select a project */}
          <div className="form-group mb-3">
            <label htmlFor="projectSelect">Select Project</label>
            <select
              id="projectSelect"
              className="form-control"
              value={selectedProject.title || ""} // Set the value to selectedProject's title
              onChange={handleProjectChange}
            >
              <option value="">Select a Project</option>
              {projects.length > 0 ? (
                projects.map((project) => (
                  <option key={project.title} value={project.title}>
                    {project.title}
                  </option>
                ))
              ) : (
                <option value="">No projects available</option>
              )}
            </select>
          </div>

          {/* Display tasks for the selected project */}
          {selectedProject && (
            <ul className="list-group">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <li key={task._id || task.id} className="list-group-item">
                    <ul style={{ listStyle: "none" }}>
                      <li><strong>Task Name:</strong> {task.title}</li>
                      <li><strong>Task Description:</strong> {task.description}</li>
                      <li><strong>Priority:</strong> {task.priority}</li>
                      <li><strong>Module:</strong> {taskModules[task._id] || "Loading..."}</li> 
                      <li><strong>Assigned to:</strong> {userTaskAssignments[task._id] ? userTaskAssignments[task._id].join(', ') : "Not assigned"}</li>
                      <li><strong>Time Alloted (Minutes):</strong> {task.totalMinutes}</li>
                    </ul>
                  </li>
                ))
              ) : (
                <li className="list-group-item">No tasks available for this project.</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
