import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../../App";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid2,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  Button,
  CircularProgress,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export const TasksPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [userTaskAssignments, setUserTaskAssignments] = useState({});
  const [taskModules, setTaskModules] = useState({});
  const userId = Cookies.get("userId");

  const handleDeassign = async (taskId, userId) => {
    if (
      !window.confirm(
        "Are you sure you want to deassign this user from the task?"
      )
    )
      return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/user-tasks/${userId}/${taskId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to deassign user from task");

      alert("User deassigned successfully!");

      // Update UI by removing only the specific user from the task
      setUserTaskAssignments((prevAssignments) => {
        const updatedAssignments = { ...prevAssignments };
        updatedAssignments[taskId] = updatedAssignments[taskId]?.filter(
          (user) => user._id !== userId
        );
        return updatedAssignments;
      });
    } catch (error) {
      console.error("Error deassigning user from task:", error);
      alert("Failed to deassign user from task");
    }
  };

  useEffect(() => {
    const userRole = Cookies.get("role");
    setRole(userRole);

    const fetchProjects = async () => {
      try {
        const url =
          userRole === "manager"
            ? `${API_BASE_URL}/managers/${userId}/projects/`
            : `${API_BASE_URL}/developer/${userId}/`;
        const response = await axios.get(url);
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userId]);

  useEffect(() => {
    if (!selectedProject) return;

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const url =
          role === "manager"
            ? `${API_BASE_URL}/tasks/${selectedProject._id}`
            : `${API_BASE_URL}/tasks/developer/${userId}/${selectedProject._id}`;
    
        const res = await axios.get(url);
        const taskList = res.data;
        setTasks(taskList);
    
        // Fetch task details (assigned users & modules)
        const userAssignments = {};
        const moduleMappings = {};
    
        await Promise.all(
          taskList.map(async (task) => {
            try {
              const userRes = await axios.get(
                `${API_BASE_URL}/user-tasks/task/${task._id}`
              );
              userAssignments[task._id] = userRes.data.map((user) => ({
                _id: user.user_id, // Ensure this exists
                full_name: user.full_name, // Ensure this exists
              })); // Store full user objects
            } catch (error) {
              console.error(`Error fetching users for task ${task._id}:`, error);
            }
    
            if (task.module_id) {
              try {
                const moduleRes = await axios.get(
                  `${API_BASE_URL}/modules/modules/${task.module_id}`
                );
                moduleMappings[task._id] = moduleRes.data.moduleName;
              } catch (error) {
                console.error(`Error fetching module for task ${task._id}:`, error);
                moduleMappings[task._id] = "Unknown Module";
              }
            }
          })
        );
    
        setUserTaskAssignments(userAssignments);
        setTaskModules(moduleMappings);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    

    fetchTasks();
  }, [selectedProject, role, userId]);

  return (
    <Grid2 container spacing={3} sx={{ p: 3 }}>
      {loading ? (
        <Grid2 item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Grid2>
      ) : (
        <>
          {/* Project Selection Dropdown */}
          <Grid2 item xs={12} sx={{ mb: 2 }}>
            <FormControl
              fullWidth
              sx={{
                backgroundColor: "#ffffff",
                borderRadius: 2,
                boxShadow: 2,
                p: 1,
                "& .MuiInputBase-root": {
                  borderRadius: 2,
                  fontSize: "16px",
                  fontWeight: "bold",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#1565c0",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#0d47a1",
                },
                transition: "0.3s",
              }}
            >
              <Select
                value={selectedProject ? selectedProject._id : ""}
                onChange={(e) => {
                  const project = projects.find(
                    (proj) => proj._id === e.target.value
                  );
                  setSelectedProject(project);
                }}
                displayEmpty
              >
                <MenuItem disabled value="">
                  <em>Select a project</em>
                </MenuItem>
                {projects.map((project) => (
                  <MenuItem
                    key={project._id}
                    value={project._id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#bbdefb",
                      },
                    }}
                  >
                    {project.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>

          {/* Task List */}
          {selectedProject && (
            <Grid2 item xs={12}>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <Card
                    key={task._id}
                    sx={{
                      boxShadow: 4,
                      borderRadius: 3,
                      mb: 3,
                      backgroundColor: "#f9f9f9",
                      transition: "0.3s",
                      "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardHeader
                      title={
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", color: "#0d47a1" }}
                        >
                          {task.title}
                        </Typography>
                      }
                      subheader={
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "bold", color: "#ff5722" }}
                        >
                          Priority: {task.priority}
                        </Typography>
                      }
                      sx={{
                        backgroundColor:
                          task.priority === "High"
                            ? "#ffebee"
                            : task.priority === "Medium"
                            ? "#fff3e0"
                            : "#e8f5e9",
                      }}
                    />
                    <CardContent>
                      <Typography variant="body2">
                        <strong>Description:</strong> {task.description}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Assigned to:</strong>
                        <span>
                          {userTaskAssignments[task._id]?.length > 0
                            ? userTaskAssignments[task._id].map((user) => (
                                <Chip
                                  key={user._id}
                                  label={user.full_name} // Now full_name exists
                                  onDelete={() => handleDeassign(task._id, user._id)}
                                  sx={{
                                    m: 0.5,
                                    backgroundColor: "#ff9800",
                                    color: "white",
                                    "& .MuiChip-deleteIcon": {
                                      color: "#d32f2f",
                                    },
                                  }}
                                />
                              ))
                            : "Not assigned"}
                        </span>
                      </Typography>

                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Time Allotted:</strong> {task.totalMinutes}{" "}
                        minutes
                      </Typography>
                    </CardContent>

                    {/* Module Details */}
                    <Accordion sx={{ backgroundColor: "#f5f5f5" }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "bold", color: "#1565c0" }}
                        >
                          Module Details
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Chip
                          label={taskModules[task._id] || "Loading..."}
                          sx={{
                            backgroundColor: "#4caf50",
                            color: "white",
                            fontWeight: "bold",
                          }}
                        />
                      </AccordionDetails>
                    </Accordion>

                    {/* More Details */}
                    <Accordion sx={{ backgroundColor: "#e3f2fd" }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "bold", color: "#1565c0" }}
                        >
                          More Details
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2">
                          <strong>Deadline:</strong>{" "}
                          {task.deadline || "Not set"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Status:</strong> {task.status || "Pending"}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  </Card>
                ))
              ) : (
                <Typography variant="h6" sx={{ textAlign: "center", mt: 3 }}>
                  No tasks available for this project.
                </Typography>
              )}
            </Grid2>
          )}
        </>
      )}
    </Grid2>
  );
};
