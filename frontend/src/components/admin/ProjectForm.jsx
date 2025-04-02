import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import { API_BASE_URL } from "../../App";

export const ProjectForm = ({ project }) => {
  const { register, handleSubmit, reset, watch, setError, clearErrors, formState: { errors }, setValue } = useForm();
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/managers`);
        if (!response.ok) throw new Error("Failed to fetch managers");
        const data = await response.json();
        setManagers(data.map(manager => ({ value: manager.email, label: manager.email })));
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
    };
    fetchManagers();
  }, []);

  useEffect(() => {
    if (project) {
      setValue("title", project.title);
      setValue("description", project.description);
      setValue("technology", project.technology);
      setValue("estimatedHours", project.estimatedHours);
      setValue("startDate", project.startDate.split('T')[0]); // Assuming the startDate is in ISO format
      setValue("completionDate", project.completionDate.split('T')[0]); // Assuming the completionDate is in ISO format
      setValue("managerEmail", project.manager_email);
    }
  }, [project, setValue]);

  
  const onSubmit = async (data) => {
    const startDate = new Date(data.startDate);
    const completionDate = new Date(data.completionDate);
    const estimatedHours = parseInt(data.estimatedHours, 10);

    if (startDate <= new Date()) {
      setError("startDate", { type: "manual", message: "Start date must be in the future" });
      return;
    }
    if (completionDate <= new Date()) {
      setError("completionDate", { type: "manual", message: "Completion date must be in the future" });
      return;
    }
    if (completionDate - startDate < estimatedHours * 60 * 60 * 1000) {
      setError("completionDate", { type: "manual", message: "Completion date must be at least estimated hours apart from start date" });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/project/`, {
        method: project ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          technology: data.technology,
          estimatedHours: estimatedHours,
          startDate: data.startDate,
          completionDate: data.completionDate,
          manager_email: data.managerEmail,
          developers: []
        }),
      });

      if (!response.ok) throw new Error(project ? "Failed to update project" : "Failed to create project");
      alert(project ? "Project updated successfully!" : "Project created successfully!");
      reset();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="container mt-4 p-4 shadow-lg rounded" style={{ backgroundColor: "#f8f9fa", maxWidth: "600px" }}>
      <h3 className="text-center text-primary">Create New Project</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label fw-bold text-secondary">Project Title</label>
          <input className="form-control border-primary" {...register("title", { required: "This field is required" })} />
          {errors.title && <div className="text-danger">{errors.title.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold text-secondary">Description</label>
          <textarea className="form-control border-primary" {...register("description", { required: "This field is required" })} />
          {errors.description && <div className="text-danger">{errors.description.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold text-secondary">Technology</label>
          <input className="form-control border-primary" {...register("technology", { required: "This field is required" })} />
          {errors.technology && <div className="text-danger">{errors.technology.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold text-secondary">Estimated Hours</label>
          <input type="number" className="form-control border-primary" 
            {...register("estimatedHours", { 
              required: "This field is required", 
              min: { value: 1, message: "Estimated hours must be greater than 0" } 
            })} 
          />
          {errors.estimatedHours && <div className="text-danger">{errors.estimatedHours.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold text-secondary">Start Date</label>
          <input type="date" className="form-control border-primary" 
            {...register("startDate", { required: "This field is required" })} 
            onChange={() => clearErrors("startDate")} 
          />
          {errors.startDate && <div className="text-danger">{errors.startDate.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold text-secondary">Completion Date</label>
          <input type="date" className="form-control border-primary" 
            {...register("completionDate", { required: "This field is required" })} 
            onChange={() => clearErrors("completionDate")} 
          />
          {errors.completionDate && <div className="text-danger">{errors.completionDate.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold text-secondary">Manager Email</label>
          <Select options={managers} onChange={(option) => setValue("managerEmail", option.value)} />
          {errors.managerEmail && <div className="text-danger">{errors.managerEmail.message}</div>}
        </div>

        <button type="submit" className="btn btn-success w-100">{project ? "Update Project" : "Create Project"}</button>
      </form>
    </div>
  );
};
