import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { API_BASE_URL } from '../../App';
import './AssignTask.css';

export const AssignTask = () => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const managerId = Cookies.get("userId");
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null); // Now it's an object, not an array

  // Fetch projects and developers on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/managers/${managerId}/projects/`);
        setProjects(res.data); // Set projects from API
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    const fetchDevelopers = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/managers/${managerId}/developers/`);
        setDevelopers(res.data); // Set developers from API
      } catch (error) {
        console.error("Error fetching developers:", error);
      }
    };

    fetchProjects();
    fetchDevelopers();
  }, [managerId]);

  // Fetch tasks when project is selected
  useEffect(() => {
    if (selectedProject) {
      fetchTasksForProject(selectedProject._id); // Fetch tasks for selected project
    }
  }, [selectedProject]); // Add selectedProject as dependency

  const fetchTasksForProject = async (projectId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/tasks/${projectId}`); // Correct API endpoint
      setTasks(res.data); // Set tasks related to the selected project
      setValue("task_id", ""); // Reset task selection when changing project
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Form submit handler to assign developers to a task
  const submitHandler = async (data) => {
    // Loop through the selected developers and send a POST request for each
    try {
      // Make multiple POST requests for each developer
      for (let developerId of data.developers) {
        const requestData = {
          userId: developerId,  // Developer ID
          taskId: data.task_id, // Task ID to assign
        };
  
        const res = await axios.post(`${API_BASE_URL}/user-tasks/assign`, requestData);
        
        if (res.status === 200) {
          console.log(`Developer ${developerId} assigned successfully`);
        } else {
          alert(`Developer ${developerId} assignment failed`);
        }
      }
      
      alert("Developers assigned successfully");
      reset(); // Clear the form fields after successful submission
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    }
  };
  

  return (
    <div>
      <h5>Assign Developers to Task</h5>
      <form onSubmit={handleSubmit(submitHandler)}>
        <div className="row">
          <div className="col-md-6">
            {/* Project Dropdown */}
            <div className="form-group">
              <label>Project</label>
              <select
                {...register("project_id", { required: true })}
                className="form-control"
                onChange={(e) => {
                  const project = projects.find(p => p._id === e.target.value); 
                  setSelectedProject(project); // Set the entire project object
                }}
              >
                <option value="">Select a Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Task Dropdown */}
            <div className="form-group">
              <label>Task</label>
              <select
                {...register("task_id", { required: true })}
                className="form-control"
              >
                <option value="">Select a Task</option>
                {tasks.map((task) => (
                  <option key={task._id} value={task._id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Developers Dropdown */}
            <div className="form-group">
              <label>Developers</label>
              <select
                {...register("developers", { required: true })}
                multiple
                className="form-control black-text"
              >
                {developers.map((developer) => (
                  <option key={developer._id} value={developer._id}>
                    {developer.firstname}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Assign Developers
        </button>
      </form>
    </div>
  );
};
