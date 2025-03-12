import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Select from "react-select";
import { API_BASE_URL } from "../../App";

const AssignProjectToDevelopers = () => {
  const [projects, setProjects] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [selectedDevelopers, setSelectedDevelopers] = useState([]);
  const [existingDevelopers, setExistingDevelopers] = useState([]); // Always default to empty array
  const [selectedProject, setSelectedProject] = useState(null);

  const managerId = Cookies.get("userId");

  useEffect(() => {
    if (!managerId) {
      alert("Manager not logged in");
      return;
    }

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

    const fetchDevelopers = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/admin/developers`
        );
        setDevelopers(response.data || []);
      } catch (error) {
        console.error("Error fetching developers:", error);
      }
    };

    fetchProjects();
    fetchDevelopers();
  }, [managerId]);

  const fetchAssignedDevelopers = async (projectId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/developers`);
      setExistingDevelopers(response.data || []);
    } catch (error) {
      console.error("Error fetching assigned developers:", error);
      setExistingDevelopers([]);
    }
  };

  const handleProjectChange = async (selectedProject) => {
    setSelectedProject(selectedProject);
    setSelectedDevelopers([]);

    if (selectedProject) {
      fetchAssignedDevelopers(selectedProject.value);
    }
  };

  const handleAssign = async () => {
    if (!selectedProject) {
      alert("Please select a project.");
      return;
    }
  
    try {
      for (const dev of selectedDevelopers) {
        await axios.put(
          `${API_BASE_URL}/admin/projects/${selectedProject.value}/assign-developers/${dev.value}`
        );
      }
  
      alert("Developers assigned successfully!");
      setSelectedDevelopers([]);
      fetchAssignedDevelopers(selectedProject.value);
    } catch (error) {
      console.error("Error assigning developers:", error);
      alert("Error assigning developers.");
    }
  };
  

  const handleRemoveDeveloper = async (developerId) => {
    if (!selectedProject) return;
  
    try {
      await axios.delete(
        `${API_BASE_URL}/admin/projects/${selectedProject.value}/deassign-developers/${developerId}`
      );
  
      alert("Developer removed successfully!");
      fetchAssignedDevelopers(selectedProject.value);
    } catch (error) {
      console.error("Error removing developer:", error);
      alert("Failed to remove developer.");
    }
  };
  

  // Filter out already assigned developers from the dropdown
  const availableDevelopers = (developers || []).filter(
    (dev) => !(existingDevelopers || []).some((assigned) => assigned._id === dev._id)
  );

  return (
    <div className="container mt-3">
      <h3>Assign Developers to a Project</h3>

      {/* Project Dropdown */}
      <label className="form-label">Select Project:</label>
      <Select
        value={selectedProject}
        onChange={handleProjectChange}
        options={projects.map((project) => ({
          value: project._id,
          label: project.title,
        }))}
        placeholder="Search and select a project"
      />

      {/* Show Assigned Developers */}
      {selectedProject && existingDevelopers.length > 0 && (
        <div className="mt-4">
          <h4>Assigned Developers</h4>
          <ul className="list-group">
            {existingDevelopers.map((dev) => (
              <li
                key={dev._id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {dev.firstname} ({dev.email})
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemoveDeveloper(dev._id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Select Developers */}
      <label className="form-label mt-3">Select Developers:</label>
      {availableDevelopers.length > 0 ? (
        <Select
          isMulti
          value={selectedDevelopers}
          onChange={setSelectedDevelopers}
          options={availableDevelopers.map((dev) => ({
            value: dev._id,
            label: dev.firstname,
          }))}
          placeholder="Search and select developers"
        />
      ) : (
        <p className="text-muted">No developers left to assign on this project.</p>
      )}

      {/* Assign Button */}
      {availableDevelopers.length > 0 && (
        <button className="btn btn-primary mt-3" onClick={handleAssign}>
          Assign Developers
        </button>
      )}
    </div>
  );
};

export default AssignProjectToDevelopers;
