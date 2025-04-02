import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { API_BASE_URL } from '../../App';

export const ManageModules = () => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const managerId = Cookies.get("userId");
  
  const [modules, setModules] = useState([]);
  const [projects, setProjects] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch projects for dropdown
  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/`);
      console.log(response);
      
      setProjects(response.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchAllModules = async () => {
    try {
        const projectsResponse = await axios.get(`${API_BASE_URL}/projects/`);
        const projects = projectsResponse.data;

        if (!projects || projects.length === 0) {
            setModules([]);
            setStatuses([]);
            return;
        }

        let allModules = [];
        let allStatuses = new Map();

        for (const project of projects) {
            const response = await axios.get(`${API_BASE_URL}/status/${project._id}/modules-statuses`);
            
            // Store statuses in a Map (ID → Status Object)
            response.data.statuses.forEach(status => {
                allStatuses.set(status._id, status);
            });

            response.data.modules.forEach((module) => {
                allModules.push({
                    ...module,
                    status: allStatuses.get(module.status) || { _id: module.status, status: "Unknown" }
                });
            });
        }

        setModules(allModules);
        setStatuses(Array.from(allStatuses.values())); // Convert Map back to array
    } catch (error) {
        console.error("Error fetching all modules:", error);
    }
  };


  

  // Load all data on component mount
  useEffect(() => {
    fetchProjects();
    fetchAllModules();
  }, []);

  // Form submit handler to add/update a module
  const moduleFormHandler = async (data) => {
    const estimatedHours = parseInt(data.estimatedHours, 10);
    if (estimatedHours <= 0) {
        alert("Estimated Hours must be greater than zero");
        return;
    }

    if (!data.project_id) {
        alert("Please select a project before submitting.");
        return;
    }

    const moduleData = {
        projectId: data.project_id, 
        projectName: projects.find(p => p._id === data.project_id)?.title || "Unknown", 
        moduleName: data.moduleName,
        description: data.description,
        estimatedHours: estimatedHours, 
        status: statuses.find(s => s._id === data.status) ? data.status : null,
        startDate: data.startDate,
    };

    console.log("Request data:", moduleData);

    try {
        let res;

        if (isEditing) {
            // Update existing module
            res = await axios.put(`${API_BASE_URL}/modules/${selectedModule._id}`, moduleData);
            if (res.status === 200) {
                alert("Module updated successfully");
            } else {
                alert("Module update failed");
            }
        } else {
            // Add new module
            res = await axios.post(`${API_BASE_URL}/modules`, moduleData);
            if (res.status === 200) {
                alert("Module added successfully");
            } else {
                alert("Module addition failed");
            }
        }

        // Reset form and state
        reset();
        setIsEditing(false);
        setSelectedModule(null);
        fetchAllModules(); // Refresh the modules list

    } catch (error) {
        console.error("Error submitting form:", error);
        alert("An error occurred. Please try again.");
    }
  };


  // Handle delete module
  const handleDeleteModule = async (moduleId) => {
    if (window.confirm("Are you sure you want to delete this module?")) {
      try {
        const res = await axios.delete(`${API_BASE_URL}/modules/${moduleId}`);
        if (res.status === 200) {
          alert("Module deleted successfully");
          fetchAllModules(); // Refresh the modules list
        } else {
          alert("Failed to delete module");
        }
      } catch (error) {
        console.error("Error deleting module:", error);
        alert("An error occurred. Please try again.");
      }
    }
  };

  // Handle selecting a module for editing
  const handleEditModule = (module) => {
    setIsEditing(true);
    setSelectedModule(module);
    
    // Set form values
    setValue("moduleName", module.moduleName);
    setValue("description", module.description);
    setValue("estimatedHours", module.estimatedHours);
    setValue("startDate", module.startDate ? module.startDate.substring(0, 10) : '');

    // ✅ Auto-select Project in dropdown
    const selectedProject = projects.find(p => p.title.trim().toLowerCase() === module.project_name.trim().toLowerCase());
    setValue("project_id", selectedProject ? selectedProject._id : "");

    // ✅ Auto-select Status in dropdown using status name
    setValue("status", module.status?._id || "");
};


  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedModule(null);
    reset(); // Clear form fields
  };

  return (
    <div className="container">
      <h4 className="mb-4">Module Management</h4>
      
      {/* Combined Add/Update Module Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>{isEditing ? "Update Module" : "Add New Module"}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit(moduleFormHandler)}>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group mb-3">
                  <label>Module Title</label>
                  <input type="text" {...register("moduleName", { required: true })} id="moduleName" className="form-control" />
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea {...register("description")} id="description" className="form-control" rows="3"></textarea>
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="startDate" className="form-label">Start Date</label>
                  <input type="date" {...register("startDate")} id="startDate" className="form-control" />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group mb-3">
                  <label htmlFor="projectName" className="form-label">Project</label>
                  <select
                    {...register("project_id")}  
                    id="projectName"
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

                <div className="form-group mb-3">
                  <label htmlFor="estimatedHours" className="form-label">Estimated Hours</label>
                  <input type="number" {...register("estimatedHours")} id="estimatedHours" className="form-control" />
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    {...register("status")}  
                    id="status"
                    className="form-control"
                  >
                    <option value="">Select Status</option>
                    {statuses.map((status) => (
                      <option key={status._id} value={status._id} style={{ color: 'black' }}>
                        {status.status} 
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group mt-3">
              <button type="submit" className="btn btn-primary me-2">
                {isEditing ? "Update Module" : "Add Module"}
              </button>
              {isEditing && (
                <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      
      {/* Modules List */}
      <div className="card">
        <div className="card-header">
          <h5>All Modules</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Module Name</th>
                  <th>Project</th>
                  <th>Estimated Hours</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {modules.map(module => (
                  <tr key={module._id}>
                    <td>{module.moduleName}</td>
                    <td>{module.project_name|| 'N/A'}</td>
                    <td>{module.estimatedHours}</td>
                    <td>{module.status?.status || 'N/A'}</td>
                    <td>{module.startDate ? new Date(module.startDate).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-info me-2" 
                        onClick={() => handleEditModule(module)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => handleDeleteModule(module._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {modules.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center">No modules found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
