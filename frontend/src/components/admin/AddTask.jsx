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

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/projects/`
      );
      setProjects(response.data || []); // Ensure it's an array
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };
  useEffect(() => {
    fetchProjects();
  },[]);

  // Fetch modules and statuses when a project is selected
  const fetchModulesAndStatuses = async (projectId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/status/${projectId}/modules-statuses/`);      
      setModules(res.data.modules);  // Update modules based on the selected project
      setStatuses(res.data.statuses);
      console.log(res.data.statuses);
      // Set the default status to 'Assigned' after fetching statuses
      const assignedStatus = res.data.statuses.find(status => status.status === 'Assigned');
      if (assignedStatus) {
        console.log("Setting status ID:", assignedStatus._id);
        setValue('status_id', assignedStatus._id); // Ensure ID is set
      }
    } catch (error) {
      console.error("Error fetching modules and statuses:", error);
    }
  };

  const submitHandler = async (data) => {
    data.totalMinutes = parseInt(data.totalMinutes, 10); // Ensure it's an integer
    data.priority = String(data.priority);
     
    if (!data.status_id) {
      alert("Please select a valid status.");
      return;
    }

    console.log("Submitting data:", data);

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
              <label htmlFor="statusId" className="form-label">Status</label>
              <select {...register("status_id")}  id="statusId" className="form-control">
                <option value="">Select Status</option>
                {statuses.map((status) => (
                  <option key={status._id} value={status._id}>
                    {status.status} 
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
