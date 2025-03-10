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
  const fetchTasksForProject = async (projectId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/projects/${projectId}/tasks`);
      setTasks(res.data); // Set tasks related to the selected project
      setValue("task_id", ""); // Reset task selection when changing project
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Form submit handler to assign developers to a task
  const submitHandler = async (data) => {
    const requestData = {
      developers: data.developers, // List of developer IDs
      taskId: data.task_id, // The task to assign developers to
    };
    console.log("Request data:", requestData);
    try {
      const res = await axios.put(`${API_BASE_URL}/tasks/${data.task_id}/assign-developers/${managerId}`, requestData);
      if (res.status === 200) {
        alert("Developers assigned successfully");
        reset(); // Clear the form fields after successful submission
      } else {
        alert("Developer assignment failed");
      }
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
                onChange={(e) => fetchTasksForProject(e.target.value)}
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
