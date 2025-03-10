import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { API_BASE_URL } from '../../App';

export const AddTask = () => {
  const { register, handleSubmit, setValue } = useForm();
  const managerId = Cookies.get("userId");
  const [projects, setProjects] = useState([]);
  const [modules, setModules] = useState([]);
  const [statuses,setStatuses] = useState([])

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/managers/${managerId}/projects/`);
        setProjects(res.data); // Set projects from API
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [managerId]);

  // Fetch modules and statuses when a project is selected
  const fetchModulesAndStatuses = async (projectId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/modules/modules/${projectId}/modules-statuses/`);
      setModules(res.data.modules);  // Update modules based on the selected project

      // Set the default status to 'Assigned' after fetching statuses
      const assignedStatus = res.data.statuses.find(status => status.statusName === 'Assigned');
      if (assignedStatus) {
        setValue('status_id', assignedStatus._id); // Set 'Assigned' status as default value
      }
    } catch (error) {
      console.error("Error fetching modules and statuses:", error);
    }
  };

  const submitHandler = async (data) => {
    data.totalMinutes = parseInt(data.totalMinutes, 10); // Ensure it's an integer
    data.status_id = data.status;
    
    try {
      const res = await axios.post(`${API_BASE_URL}/tasks/`, data);
      if (res.status === 200) {
        alert("Task added successfully");
        // Optionally navigate after success
        // navigate('/tasks');
      } else {
        alert("Task addition failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    }
  };

  // Fetch statuses from backend
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/status/statuss`);
        setStatuses(res.data);  // Set statuses from API
      } catch (error) {
        console.error("Error fetching statuses:", error);
      }
    };

    fetchStatuses();
  }, []);

  // Handle project selection
  const handleProjectChange = (e) => {
    const selectedProjectId = e.target.value;
    setValue("project_id", selectedProjectId);  // Set the selected project in the form
    fetchModulesAndStatuses(selectedProjectId);  // Fetch modules for the selected project
  };

  return (
    <div>
      <h5>Add Task Form</h5>
      <form onSubmit={handleSubmit(submitHandler)}>
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>Task Title</label>
              <input type="text" {...register("title")} id="title" className="form-control" />
            </div>

            <div className="form-group">
              <label htmlFor="priority" className="form-label">Priority (1-5)</label>
              <input type="range" {...register("priority")} id="priority" className="form-range" min="1" max="5" step="1" />
              <div className="d-flex justify-content-between">
                <span>1</span>
                <span>5</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea {...register("description")} id="description" className="form-control" rows="3"></textarea>
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="projectId" className="form-label">Project</label>
              <select
                {...register("project_id")}  // This binds the selected project to the form state
                id="projectId"
                className="form-control"
                onChange={handleProjectChange}  // Trigger the function to fetch modules when a project is selected
              >
                <option value="">Select a Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title} {/* Assuming project has a title */}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="moduleId" className="form-label">Module</label>
              <select {...register("module_id")} id="moduleId" className="form-control">
                <option value="">Select a Module</option>
                {modules.map((module) => (
                  <option key={module._id} value={module._id}>
                    {module.moduleName}  {/* Assuming module has a moduleName property */}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="totalMinutes" className="form-label">Total Minutes</label>
              <input type="number" {...register("totalMinutes")} id="totalMinutes" className="form-control" />
            </div>
            <div className="form-group">
              <label htmlFor="status" className="form-label">Status</label>
              <select
                {...register("status")}  
                id="status"
                className="form-control"
              >
                <option value="">Select Status</option>
                {statuses.map((status) => (
                  <option key={status._id} value={status._id}>
                    {status.statusName} 
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Add Task
        </button>
      </form>
    </div>
  );
};
