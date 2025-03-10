import React, { useEffect, useState } from 'react';
import Cookies from "js-cookie";
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { API_BASE_URL } from '../../App';
import './AssignTask.css';

export const AssignTask = () => {
  const { register, handleSubmit, reset } = useForm();
  const managerId = Cookies.get("userId");
  const [projects, setProjects] = useState([]);
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

  // Form submit handler to assign developers to a project
  const submitHandler = async (data) => {
    const requestData = {
      developers: data.developers,  // List of developer IDs
    };
    console.log("Request data:", requestData);
    try {
      const res = await axios.put(`${API_BASE_URL}/projects/${data.project_id}/assign-developers/${managerId}`, requestData); 
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
      <h5>Assign Developers to Project</h5>
      <form onSubmit={handleSubmit(submitHandler)}>
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>Project</label>
              <select
                {...register("project_id", { required: true })}
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
