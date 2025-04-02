import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../App';

export const EditTask = ({ task, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    priority: '',
    description: '',
    totalMinutes: 0,
    module_id: '',
    project_id: '',
    status_id: ''
  });
  const [projects, setProjects] = useState([]);
  const [modules, setModules] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        priority: task.priority,
        description: task.description,
        totalMinutes: task.totalMinutes,
        module_id: task.module_id?._id || '',
        project_id: task.project_id?._id || '',
        status_id: task.status_id?._id || ''
      });

      fetchModulesAndStatuses(task.project_id?._id);
    }
  }, [task]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/projects/`)
      .then(res => setProjects(res.data || []))
      .catch(err => console.error("Error fetching projects:", err));
  }, []);

  const fetchModulesAndStatuses = async (projectId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/status/${projectId}/modules-statuses/`);
      setModules(res.data.modules);
      setStatuses(res.data.statuses);
    } catch (error) {
      console.error("Error fetching modules and statuses:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleProjectChange = async (e) => {
    const selectedProjectId = e.target.value;
    setFormData(prevState => ({
      ...prevState,
      project_id: selectedProjectId,
      module_id: '',
      status_id: ''
    }));

    await fetchModulesAndStatuses(selectedProjectId);
  };

  const handleFileChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });

    if (selectedImage) {
      formDataToSend.append("image", selectedImage);
    }

    try {
      const res = await axios.put(`${API_BASE_URL}/tasks/${task._id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.status === 200) {
        alert("Task updated successfully");
        onUpdate();
      } else {
        alert("Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5>Update Task</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleUpdateSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group mb-3">
                <label>Task Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-control" required />
              </div>

              <div className="form-group mb-3">
                <label>Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange} className="form-control" required>
                  {["Low", "Medium", "High", "Urgent"].map((priority, index) => (
                    <option key={index} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-3">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" rows="3" required></textarea>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group mb-3">
                <label>Project</label>
                <select name="project_id" value={formData.project_id} onChange={handleProjectChange} className="form-control" required>
                  <option value="">Select a Project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>{project.title}</option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-3">
                <label>Module</label>
                <select name="module_id" value={formData.module_id} onChange={handleChange} className="form-control" required>
                  <option value="">Select a Module</option>
                  {modules.map((module) => (
                    <option key={module._id} value={module._id}>{module.moduleName}</option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-3">
                <label>Status</label>
                <select name="status_id" value={formData.status_id} onChange={handleChange} className="form-control" required>
                  <option value="">Select Status</option>
                  {statuses.map((status) => (
                    <option key={status._id} value={status._id}>{status.status}</option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-3">
                <label>Update Image (Optional)</label>
                <input type="file" onChange={handleFileChange} className="form-control" />
                {task.image && !selectedImage && (
                  <div className="mt-2">
                    <p>Current image: {task.image.split('/').pop()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group mt-3">
            <button type="submit" className="btn btn-primary me-2">Update Task</button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

