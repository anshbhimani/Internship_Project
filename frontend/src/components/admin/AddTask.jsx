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
  const [statuses, setStatuses] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/`);
      setProjects(response.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchModulesAndStatuses = async (projectId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/status/${projectId}/modules-statuses/`);
      setModules(res.data.modules);
      setStatuses(res.data.statuses);
      const assignedStatus = res.data.statuses.find(status => status.status === 'Assigned');
      if (assignedStatus) {
        setValue('status_id', assignedStatus._id);
      }
    } catch (error) {
      console.error("Error fetching modules and statuses:", error);
    }
  };

  const submitHandler = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("priority", data.priority);
    formData.append("description", data.description);
    formData.append("totalMinutes", parseInt(data.totalMinutes, 10));
    formData.append("module_id", data.module_id);
    formData.append("project_id", data.project_id);
    formData.append("status_id", data.status_id);
    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/tasks/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.status === 200) {
        alert("Task added successfully");
      } else {
        alert("Task addition failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleProjectChange = (e) => {
    const selectedProjectId = e.target.value;
    setValue("project_id", selectedProjectId);
    fetchModulesAndStatuses(selectedProjectId);
  };

  const handleFileChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  return (
    <div>
      <h5>Add Task Form</h5>
      <form onSubmit={handleSubmit(submitHandler)}>
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>Task Title</label>
              <input type="text" {...register("title")} className="form-control" required/>
            </div>
            <div className="form-group">
              <label htmlFor="priority">Priority (1-5)</label>
              <input type="range" {...register("priority")} id="priority" className="form-range" min="1" max="5" step="1" required/>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea {...register("description")} className="form-control" rows="3" required></textarea>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Project</label>
              <select {...register("project_id")} className="form-control" onChange={handleProjectChange} required>
                <option value="">Select a Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>{project.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Module</label>
              <select {...register("module_id")} className="form-control" required>
                <option value="">Select a Module</option>
                {modules.map((module) => (
                  <option key={module._id} value={module._id}>{module.moduleName}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Total Minutes</label>
              <input type="number" {...register("totalMinutes")} className="form-control" required/>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select {...register("status_id")} className="form-control" required>
                <option value="">Select Status</option>
                {statuses.map((status) => (
                  <option key={status._id} value={status._id}>{status.status}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Upload UI Image (If needed)</label>
              <input type="file" className="form-control" onChange={handleFileChange} />
            </div>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Add Task</button>
      </form>
    </div>
  );
};
