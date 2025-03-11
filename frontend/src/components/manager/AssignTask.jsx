import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import axios from "axios";
import { API_BASE_URL } from "../../App";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import { motion } from "framer-motion";

export const AssignTask = () => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const managerId = Cookies.get("userId");

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const selectedProjectId = watch("project_id", "");
  const selectedDevelopers = watch("developers", []);

  // Fetch projects when the page loads
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/managers/${managerId}/projects/`);
        setProjects(res.data);
      } catch (error) {
        setErrorMsg("Error fetching projects. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [managerId]);

  // Fetch tasks when a project is selected
  useEffect(() => {
    const fetchTasksForProject = async () => {
      if (!selectedProjectId) {
        setTasks([]);
        setValue("task_id", "");
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/tasks/${selectedProjectId}`);
        setTasks(res.data);
        setValue("task_id", "");
      } catch (error) {
        setErrorMsg("Error fetching tasks.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasksForProject();
  }, [selectedProjectId, setValue]);

  // Fetch developers when a project is selected
  useEffect(() => {
    const fetchDevelopers = async () => {
      if (!selectedProjectId) {
        setDevelopers([]);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/projects/${selectedProjectId}/developers`);
        setDevelopers(res.data);
      } catch (error) {
        setErrorMsg("Error fetching developers.");
      } finally {
        setLoading(false);
      }
    };

    fetchDevelopers();
  }, [selectedProjectId]);

  // Assign task to developers
  const submitHandler = async (data) => {
    try {
      setLoading(true);
      const requests = data.developers.map((developerId) =>
        axios.post(`${API_BASE_URL}/user-tasks/assign`, {
          userId: developerId,
          taskId: data.task_id,
        })
      );

      await Promise.all(requests);
      setSuccessMsg("Developers assigned successfully!");
      reset();
    } catch (error) {
      setErrorMsg("Failed to assign developers. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          maxWidth: 500,
          mx: "auto",
          borderRadius: 3,
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: "bold",
            textAlign: "center",
            color: "#1976D2",
          }}
        >
          Assign Developers to Task
        </Typography>

        {successMsg && <Alert severity="success">{successMsg}</Alert>}
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        {loading ? (
          <CircularProgress sx={{ display: "block", mx: "auto", my: 3 }} />
        ) : (
          <form onSubmit={handleSubmit(submitHandler)}>
            {/* Project Dropdown */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Project</InputLabel>
              <Select
                {...register("project_id", { required: true })}
                value={selectedProjectId}
                onChange={(e) => setValue("project_id", e.target.value)}
              >
                <MenuItem value="">Select a Project</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Task Dropdown */}
            <FormControl fullWidth sx={{ mb: 3 }} disabled={!selectedProjectId}>
              <InputLabel>Task</InputLabel>
              <Select
                {...register("task_id", { required: true })}
                defaultValue=""
              >
                <MenuItem value="">Select a Task</MenuItem>
                {tasks.map((task) => (
                  <MenuItem key={task._id} value={task._id}>
                    {task.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Developers Dropdown */}
            <FormControl fullWidth sx={{ mb: 3 }} disabled={!selectedProjectId}>
              <InputLabel>Developers</InputLabel>
              <Select
                {...register("developers", { required: true })}
                multiple
                value={Array.isArray(selectedDevelopers) ? selectedDevelopers : []}
                onChange={(e) => setValue("developers", e.target.value)}
              >
                {developers.map((developer) => (
                  <MenuItem key={developer._id} value={developer._id}>
                    {developer.firstname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{
                  py: 1.5,
                  fontSize: "16px",
                  fontWeight: "bold",
                  borderRadius: 2,
                  transition: "all 0.3s ease-in-out",
                  backgroundColor: "#1976D2",
                  "&:hover": {
                    backgroundColor: "#1565C0",
                    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                Assign Developers
              </Button>
            </motion.div>
          </form>
        )}
      </Paper>
    </motion.div>
  );
};
