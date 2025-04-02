import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../App";

export const AddTask = () => {
  const [projects, setProjects] = useState([]);
  const [modules, setModules] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    module_id: "",
    totalMinutes: "",
    image: null,
    status_id: "",
    project_id: ""
  });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch Projects
  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/`);
      setProjects(response.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Fetch Modules and Statuses for the selected project
  const fetchModulesAndStatuses = async (projectId) => {
    if (!projectId) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/status/${projectId}/modules-statuses`);
      setModules(response.data.modules || []);
      setStatuses(response.data.statuses || []);
    } catch (error) {
      console.error("Error fetching modules and statuses:", error);
    }
  };

  // Fetch Tasks for the selected project
  const fetchTasks = async (projectId) => {
    if (!projectId) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/${projectId}`);
      setTasks(response.data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Add new Task
  const addTask = async (taskData) => {
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      for (const key in taskData) {
        if (key === 'image' && taskData[key]) {
          formDataToSend.append(key, taskData[key]);
        } else if (key !== 'image') {
          formDataToSend.append(key, taskData[key]);
        }
      }
      
      await axios.post(`${API_BASE_URL}/tasks`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchTasks(selectedProject);
      resetForm();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Update Task
  // Update Task - Fixed version
const updateTask = async (taskId, taskData) => {
  try {
    // Convert string ID fields to valid ObjectId format in the backend
    const jsonData = {
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      module_id: taskData.module_id,
      totalMinutes: parseInt(taskData.totalMinutes, 10) || 0,
      status_id: taskData.status_id,
      project_id: taskData.project_id
    };
  
    console.log("Sending update data:", jsonData);
    const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, jsonData);
    console.log("Update response:", response);
    
    fetchTasks(selectedProject);
    resetForm();
  } catch (error) {
    console.error("Error updating task:", error);
    alert(`Failed to update task: ${error.response?.data?.detail || error.message}`);
  }
};
  
  // Reset form and editing state
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      module_id: "",
      totalMinutes: "",
      image: null,
      status_id: "",
      project_id: selectedProject
    });
    setSelectedTask(null);
    setIsEditing(false);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image' && files && files[0]) {
      setFormData({
        ...formData,
        image: files[0]
      });
    } else if (name === 'totalMinutes') {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : parseInt(value, 10)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing && selectedTask) {
      updateTask(selectedTask._id, formData);
    } else {
      addTask({ ...formData, project_id: selectedProject });
    }
  };

  // Handle edit button click
  const handleEditClick = (task) => {
    setSelectedTask(task);
    setIsEditing(true);
    
    setFormData({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      module_id: task.module_id || "",
      totalMinutes: task.totalMinutes || "",
      status_id: task.status_id || "",
      image: null, // Can't pre-fill file input, just keep it null
      project_id: task.project_id || selectedProject
    });
  };

  // Initialize component
  useEffect(() => {
    fetchProjects();
  }, []);

  // Update modules, statuses, and tasks when project changes
  useEffect(() => {
    if (selectedProject) {
      fetchModulesAndStatuses(selectedProject);
      fetchTasks(selectedProject);
      setFormData(prev => ({ ...prev, project_id: selectedProject }));
    } else {
      setModules([]);
      setStatuses([]);
      setTasks([]);
    }
  }, [selectedProject]);

  // Get priority label class
  const getPriorityBadgeClass = (priority) => {
    switch(priority.toLowerCase()) {
      case 'high': return 'bg-danger';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  // Get status name from ID
  const getStatusName = (statusId) => {
    const status = statuses.find(s => s._id === statusId);
    return status ? status.status : "Unknown";
  };

  return (
    <div>
      <h4>Manage Tasks</h4>
      {/* Project Selection Dropdown */}
      <div className="mb-3">
        <label htmlFor="projectSelect" className="form-label">Select Project</label>
        <select
          id="projectSelect"
          className="form-control"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">Select a Project</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>{project.title}</option>
          ))}
        </select>
      </div>

      {/* Task Form */}
      {selectedProject && (
        <div className="card mb-4">
          <div className="card-header">
            {isEditing ? "Edit Task" : "Add New Task"}
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="title" className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
              </div>

              <div className="row mb-3">
                <div className="col">
                  <label htmlFor="priority" className="form-label">Priority</label>
                  <select
                    className="form-control"
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="col">
                  <label htmlFor="module_id" className="form-label">Module</label>
                  <select
                    className="form-control"
                    id="module_id"
                    name="module_id"
                    value={formData.module_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a Module</option>
                    {modules.map((mod) => (
                      <option key={mod._id} value={mod._id}>
                        {mod.moduleName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="totalMinutes" className="form-label">Total Minutes</label>
                <input
                  type="number"
                  className="form-control"
                  id="totalMinutes"
                  name="totalMinutes"
                  value={formData.totalMinutes}
                  onChange={handleChange}
                />
              </div>

              {!isEditing && (
                <div className="mb-3">
                  <label htmlFor="image" className="form-label">Upload Image (Optional)</label>
                  <input
                    type="file"
                    className="form-control"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                  />
                </div>
              )}

              {isEditing && selectedTask?.ui_image_url && (
                <div className="mb-3">
                  <label className="form-label">Current Image</label>
                  <div>
                    <img 
                      src={selectedTask.ui_image_url} 
                      alt="Task" 
                      style={{ maxHeight: '100px' }} 
                      className="img-thumbnail" 
                    />
                  </div>
                  <small className="text-muted">Image updates are not supported in this version</small>
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="status_id" className="form-label">Status</label>
                <select
                  className="form-control"
                  id="status_id"
                  name="status_id"
                  value={formData.status_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Status</option>
                  {statuses.map((stat) => (
                    <option key={stat._id} value={stat._id}>
                      {stat.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? "Update Task" : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task List */}
      {selectedProject && tasks.length > 0 ? (
        <div className="list-group">
          {tasks.map((task) => (
            <div key={task._id} className="list-group-item list-group-item-action">
              <div className="d-flex w-100 justify-content-between align-items-center">
                <h5 className="mb-1">{task.title}</h5>
                <button 
                  className="btn btn-sm btn-primary" 
                  onClick={() => handleEditClick(task)}
                >
                  Edit
                </button>
              </div>
              <p className="mb-1">{task.description}</p>
              <div>
                <span className={`badge ${getPriorityBadgeClass(task.priority)} me-2`}>
                  {task.priority}
                </span>
                <span className="badge bg-secondary me-2">
                  {getStatusName(task.status_id)}
                </span>
                <small>Est. time: {task.totalMinutes} min</small>
              </div>
              {task.ui_image_url && (
                <div className="mt-2">
                  <img 
                    src={task.ui_image_url} 
                    alt="Task" 
                    style={{ maxHeight: '80px' }} 
                    className="img-thumbnail" 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        selectedProject && <p>No tasks found for this project.</p>
      )}
    </div>
  );
};