import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../App";
import "bootstrap/dist/css/bootstrap.min.css"; // Make sure Bootstrap is still imported
import { ProjectForm } from "./ProjectForm";

export const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/projects/`);
        console.log(`URL IS : ${API_BASE_URL}/projects/`);
        if (!response.ok) throw new Error("Failed to fetch projects");
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  const handleEdit = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete project");
      setProjects(projects.filter(project => project._id !== id));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProject(null);
  };

  return (
    <div className="container mt-4">
      <h3 className="text-center mb-4">Projects</h3>
      <div className="list-group">
        {projects.map((project) => (
          <div key={project._id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <h5>{project.title}</h5>
              <p>{project.description}</p>
            </div>
            <div>
              <button
                className="btn btn-warning btn-sm mx-2"
                onClick={() => handleEdit(project)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(project._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Edit Project */}
      <div className={`modal ${showModal ? 'show' : ''}`} tabIndex="-1" style={{ display: showModal ? 'block' : 'none' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Project</h5>
              <button type="button" className="btn-close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body">
              <ProjectForm project={selectedProject} closeModal={handleCloseModal} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
