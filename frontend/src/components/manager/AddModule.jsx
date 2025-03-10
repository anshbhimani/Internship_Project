import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../App';

export const AddModule = () => {
  const { register, handleSubmit, reset } = useForm();
  const managerId = Cookies.get("managerId");
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

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

  // Form submit handler to add a module
  const submitHandler = async (data) => {
    const estimatedHours = parseInt(data.estimatedHours, 10);
    if (estimatedHours <= 0) {
        alert("Estimated Hours must be greater than zero");
        return;
    }

    const startDate = data.startDate;
    const requestData = {
        projectId: data.project_id,  
        moduleName: data.moduleName,
        description: data.description,
        estimatedHours: estimatedHours, 
        status: data.status,
        startDate: startDate,
      };
    console.log("Request data : ", requestData);
    try {
      const res = await axios.post(`${API_BASE_URL}/modules/modules`, requestData); // Post to backend
      if (res.status === 200) {
        alert("Module added successfully");
        reset(); // Clear the form fields after successful submission
      } else {
        alert("Module addition failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div>
      <h5>Add Module Form</h5>
      <form onSubmit={handleSubmit(submitHandler)}>
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>Module Title</label>
              <input type="text" {...register("moduleName",{ required:true })} id="moduleName" className="form-control" />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea {...register("description")} id="description" className="form-control" rows="3"></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="startDate" className="form-label">Start Date</label>
              <input type="date" {...register("startDate")} id="startDate" className="form-control" />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="projectId" className="form-label">Project</label>
              <select
                {...register("project_id")}  
                id="projectId"
                className="form-control"
              >
                <option value="">Select a Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title} 
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="estimatedHours" className="form-label">Estimated Hours</label>
              <input type="number" {...register("estimatedHours")} id="estimatedHours" className="form-control" />
            </div>

            <div className="form-group">
              <label htmlFor="status" className="form-label">Status</label>
              <select
                {...register("status")}  
                id="status"
                className="form-control"
              >
                <option value="">Select Status</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Add Module
        </button>
      </form>
    </div>
  );
};
