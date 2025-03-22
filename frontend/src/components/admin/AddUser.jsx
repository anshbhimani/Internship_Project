import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import { Visibility, VisibilityOff } from "@mui/icons-material"; 
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { API_BASE_URL } from "../../App";

const roles = [
  { label: "Project Manager", value: "manager" },
  { label: "Developer", value: "developer" },
];

export const AddUser = () => {
  const { register, handleSubmit, reset, setError, formState: { errors }, setValue } = useForm();
  const [showPassword, setShowPassword] = useState(false); 

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register/`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: data.firstName, 
          role: data.role,
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) throw new Error("Failed to create user");
      alert("User created successfully!");
      reset();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="container mt-4 p-4 shadow-lg rounded" style={{ backgroundColor: "#f8f9fa", maxWidth: "600px" }}>
      <h3 className="text-center text-primary">Create New User</h3>
      <form onSubmit={handleSubmit(onSubmit)}>

        {/* First Name Field */}
        <div className="mb-3">
          <label className="form-label fw-bold text-secondary">First Name</label>
          <input className="form-control border-primary" {...register("firstName", { required: "This field is required" })} />
          {errors.firstName && <div className="text-danger">{errors.firstName.message}</div>}
        </div>

        {/* Role Selection */}
        <div className="mb-3">
          <label className="form-label fw-bold text-secondary">Role</label>
          <Select options={roles} onChange={(option) => setValue("role", option.value)} />
          {errors.role && <div className="text-danger">{errors.role.message}</div>}
        </div>

        {/* Email Field */}
        <div className="mb-3">
          <label className="form-label fw-bold text-secondary">Email</label>
          <input type="email" className="form-control border-primary" {...register("email", { required: "This field is required" })} />
          {errors.email && <div className="text-danger">{errors.email.message}</div>} {/* Fix: Corrected error reference */}
        </div>

        {/* Password Field with Visibility Toggle */}
        <div className="mb-3">
          <label className="form-label fw-bold text-secondary">Password</label>
          <TextField
            type={showPassword ? "text" : "password"}
            className="form-control border-primary"
            fullWidth
            {...register("password", { required: "This field is required" })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {errors.password && <div className="text-danger">{errors.password.message}</div>}
        </div>

        <button type="submit" className="btn btn-success w-100">Create User</button>
      </form>
    </div>
  );
};
