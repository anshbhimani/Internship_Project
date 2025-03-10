import React, { useState, useEffect } from "react";
import axios from "axios"; // Make sure axios is installed
import "bootstrap/dist/css/bootstrap.min.css";
import { API_BASE_URL } from "../../App";

export const TasksPage = () => {
  // States to hold the projects, selected project, and tasks
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [tasks, setTasks] = useState([]);

  // Fetch projects for the manager (replace with your API endpoint)
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/projects`); // Your API endpoint for fetching projects
        setProjects(res.data); // Assuming the response contains a list of projects
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  // Fetch tasks based on the selected project
  useEffect(() => {
    if (selectedProject) {
      const fetchTasks = async () => {
        try {
          console.log(`Selected Project: ${selectedProject}`);
          const res = await axios.get(`${API_BASE_URL}/tasks/${selectedProject}`); // Your API endpoint for tasks
          setTasks(res.data); // Assuming the response contains tasks data
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
      };
      fetchTasks();
    }
  }, [selectedProject]); // Trigger task fetching when project changes

  // Handle project selection
  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
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
              value={selectedProject}
              onChange={handleProjectChange}
            >
              <option value="">Select a Project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          {/* Display tasks for the selected project */}
          {selectedProject && (
            <ul className="list-group">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <li key={task._id || task.id} className="list-group-item"> {/* Ensuring unique key */}
                    <ul style={{ listStyle: "none" }}>
                      <li><strong>Task Name:</strong> {task.title}</li>
                      <li><strong>Task Description:</strong> {task.description}</li>
                      <li><strong>Priority:</strong> {task.priority}</li>
                      <li><strong>Assigned to:</strong> {task.assignedTo}</li>
                      <li><strong>Time Alloted (Minutes): </strong> {task.totalMinutes}</li>
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
